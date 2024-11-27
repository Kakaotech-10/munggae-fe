import { useState, useEffect, useRef } from "react";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const connectionAttempts = useRef(0);
  const currentController = useRef(null);

  const INITIAL_TIMEOUT = 10000;
  const MAX_RETRIES = 5;
  const MAX_BACKOFF_DELAY = 30000;

  const getBackoffDelay = (attempt) => {
    const baseDelay = 1000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), MAX_BACKOFF_DELAY);
    return delay + Math.random() * 1000;
  };

  const cleanup = () => {
    if (currentController.current) {
      currentController.current.abort();
      currentController.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
  };

  const refreshToken = async () => {
    try {
      const response = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("accessToken");
      throw error;
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  const handleStreamError = async (error, signal) => {
    // AbortError는 정상적인 연결 종료로 처리
    if (error.name === "AbortError") {
      console.log("Connection aborted normally");
      return;
    }

    console.error("SSE connection error:", error);
    setConnectionStatus("error");

    // 연결이 의도적으로 중단되지 않은 경우에만 재시도
    if (!signal.aborted) {
      connectionAttempts.current++;
      if (connectionAttempts.current <= MAX_RETRIES) {
        const delay = getBackoffDelay(connectionAttempts.current);
        console.log(
          `Retrying connection in ${delay}ms... Attempt: ${connectionAttempts.current}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));

        // 재연결 시도 전 상태 확인
        if (connectionStatus !== "connected") {
          await setupSSEConnection();
        }
      } else {
        setConnectionStatus("failed");
        console.error("Max retry attempts reached");
      }
    }
  };

  const setupSSEConnection = async () => {
    if (currentController.current) {
      cleanup();
    }

    const controller = new AbortController();
    currentController.current = controller;
    const { signal } = controller;

    try {
      setConnectionStatus("connecting");
      let token = localStorage.getItem("accessToken");

      if (!token) {
        token = await refreshToken();
      }

      const headers = new Headers({
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, INITIAL_TIMEOUT);
      });

      const fetchPromise = fetch("/api/v1/notifications/subscribe", {
        method: "GET",
        headers,
        credentials: "include",
        signal,
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response.status === 401) {
        await refreshToken();
        throw new Error("Token expired");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsConnected(true);
      setConnectionStatus("connected");
      connectionAttempts.current = 0;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            console.log("Stream complete");
            break;
          }

          if (signal.aborted) {
            console.log("Stream aborted");
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                setNotifications((prev) => [
                  {
                    id: data.id || Date.now(),
                    text: data.message,
                    isRead: false,
                    time: formatNotificationTime(data.timestamp || Date.now()),
                    ...data,
                  },
                  ...prev,
                ]);
              } catch (e) {
                console.warn("Error parsing notification:", e);
              }
            }
          }
        }
      } catch (streamError) {
        await handleStreamError(streamError, signal);
      }
    } catch (error) {
      await handleStreamError(error, signal);
    } finally {
      if (!signal.aborted) {
        cleanup();
      }
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  useEffect(() => {
    let isActive = true;

    const initializeSSE = async () => {
      if (isActive) {
        try {
          await setupSSEConnection();
        } catch (error) {
          console.error("Failed to initialize SSE:", error);
        }
      }
    };

    initializeSSE();

    return () => {
      isActive = false;
      cleanup();
    };
  }, []);

  return {
    notifications,
    isConnected,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    removeNotification,
    formatNotificationTime,
  };
};

export default useNotifications;
