import { EventSourcePolyfill } from "event-source-polyfill";
import { useState, useEffect, useRef } from "react";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const eventSourceRef = useRef(null);
  const connectionAttempts = useRef(0);
  const lastEventIdRef = useRef(null);

  const MAX_RETRIES = 5;
  const MAX_BACKOFF_DELAY = 30000;

  const getBackoffDelay = (attempt) => {
    const baseDelay = 1000;
    const maxJitter = 1000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), MAX_BACKOFF_DELAY);
    const jitter = (Math.random() * 0.3 + 0.85) * maxJitter;
    return delay + jitter;
  };

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
  };

  const refreshToken = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
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

  const fetchNotifications = async () => {
    try {
      let token = localStorage.getItem("accessToken");
      if (!token) {
        token = await refreshToken();
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/notifications/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        credentials: "include",
      });

      if (response.status === 401) {
        token = await refreshToken();
        return await fetchNotifications();
      }

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      throw error;
    }
  };

  const updateNotificationsState = (data) => {
    const notificationsArray = Array.isArray(data) ? data : data.content || [];
    const readNotifications = JSON.parse(
      localStorage.getItem("readNotifications") || "{}"
    );

    const formattedNotifications = notificationsArray.map((notification) => ({
      ...notification,
      id: notification.id,
      text: notification.message,
      isRead:
        notification.isRead || readNotifications[notification.id] || false,
      time: formatNotificationTime(notification.timestamp || Date.now()),
      type: notification.type,
    }));

    setNotifications(formattedNotifications);

    if (notificationsArray.length > 0) {
      const latestNotification = notificationsArray[0];
      lastEventIdRef.current = latestNotification.id.toString();
    }
  };

  const setupSSEConnection = async () => {
    cleanup();

    try {
      setConnectionStatus("connecting");
      let token = localStorage.getItem("accessToken");

      if (!token) {
        try {
          token = await refreshToken();
        } catch (error) {
          throw new Error("No authentication token available");
        }
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = new URL("/api/v1/notifications/subscribe", baseUrl);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };

      if (lastEventIdRef.current) {
        headers["Last-Event-ID"] = lastEventIdRef.current;
      }

      const eventSource = new EventSourcePolyfill(url.toString(), {
        headers,
        heartbeatTimeout: 300000,
        withCredentials: true,
      });

      eventSourceRef.current = eventSource;
      window.eventSource = eventSource; // 전역에서 접근 가능하도록 설정

      eventSource.onopen = () => {
        console.log("SSE connection opened successfully");
        setIsConnected(true);
        setConnectionStatus("connected");
        connectionAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received SSE message:", data);

          if (event.lastEventId) {
            lastEventIdRef.current = event.lastEventId;
          } else if (data.id) {
            lastEventIdRef.current = data.id.toString();
          }

          // 새로운 알림을 즉시 추가
          setNotifications((prev) => {
            // 이미 존재하는 알림인지 확인
            const exists = prev.some(
              (notification) => notification.id === data.id
            );
            if (exists) {
              return prev;
            }

            // 새로운 알림 추가
            const newNotification = {
              ...data,
              id: data.id,
              text: data.message,
              isRead: false,
              time: formatNotificationTime(data.timestamp || Date.now()),
              type: data.type,
            };

            return [newNotification, ...prev];
          });
        } catch (e) {
          console.warn("Error parsing notification:", e);
        }
      };

      eventSource.onerror = async (error) => {
        console.error("SSE error:", error);

        if (error.status === 401) {
          try {
            await refreshToken();
            await setupSSEConnection();
            return;
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            cleanup();
            setConnectionStatus("failed");
            return;
          }
        }

        cleanup();
        setConnectionStatus("error");

        if (connectionAttempts.current < MAX_RETRIES) {
          connectionAttempts.current++;
          const delay = getBackoffDelay(connectionAttempts.current);
          console.log(
            `Retrying connection in ${delay}ms... Attempt: ${connectionAttempts.current}`
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          await setupSSEConnection();
        } else {
          setConnectionStatus("failed");
          console.error("Max retry attempts reached");
        }
      };
    } catch (error) {
      console.error("Failed to setup SSE connection:", error);
      cleanup();
      throw error;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      let token = localStorage.getItem("accessToken");
      if (!token) {
        token = await refreshToken();
      }

      const response = await fetch(
        `${baseUrl}/api/v1/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          credentials: "include",
        }
      );

      if (response.status === 401) {
        token = await refreshToken();
        const retryResponse = await fetch(
          `${baseUrl}/api/v1/notifications/${notificationId}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
          }
        );

        if (!retryResponse.ok) {
          throw new Error(
            "Failed to mark notification as read after token refresh"
          );
        }
      } else if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      const readNotifications = JSON.parse(
        localStorage.getItem("readNotifications") || "{}"
      );
      readNotifications[notificationId] = true;
      localStorage.setItem(
        "readNotifications",
        JSON.stringify(readNotifications)
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    const readNotifications = JSON.parse(
      localStorage.getItem("readNotifications") || "{}"
    );

    for (const notification of notifications) {
      if (!notification.isRead) {
        try {
          await markAsRead(notification.id);
          readNotifications[notification.id] = true;
        } catch (error) {
          console.error(
            `Failed to mark notification ${notification.id} as read:`,
            error
          );
        }
      }
    }

    localStorage.setItem(
      "readNotifications",
      JSON.stringify(readNotifications)
    );
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      if (isActive) {
        try {
          const data = await fetchNotifications();
          updateNotificationsState(data);
          await setupSSEConnection();
        } catch (error) {
          console.error("Failed to initialize notifications:", error);
          setConnectionStatus("failed");
        }
      }
    };

    initialize();

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
