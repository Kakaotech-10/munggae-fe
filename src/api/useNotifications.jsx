import { EventSourcePolyfill } from "event-source-polyfill";
import { useState, useEffect, useRef } from "react";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const eventSourceRef = useRef(null);
  const connectionAttempts = useRef(0);
  const lastEventIdRef = useRef(null);
  const isInitialFetchRef = useRef(true);

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
      const response = await fetch(`${baseUrl}api/v1/auth/refresh`, {
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

  const fetchNotifications = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      let token = localStorage.getItem("accessToken");
      if (!token) {
        token = await refreshToken();
      }

      const response = await fetch(`${baseUrl}api/v1/notifications/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.status === 401) {
        token = await refreshToken();
        const retryResponse = await fetch(`${baseUrl}api/v1/notifications/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!retryResponse.ok) {
          throw new Error("Failed to fetch notifications after token refresh");
        }

        const data = await retryResponse.json();
        return data;
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

    setNotifications(
      notificationsArray.map((notification) => ({
        ...notification,
        isRead:
          readNotifications[notification.id] || notification.isRead || false,
        time: formatNotificationTime(notification.timestamp || Date.now()),
      }))
    );

    if (isInitialFetchRef.current && notificationsArray.length > 0) {
      const latestNotification = notificationsArray[0];
      lastEventIdRef.current = latestNotification.id.toString();
      isInitialFetchRef.current = false;
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

  const handleSSEMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received SSE message:", data);

      if (event.lastEventId) {
        lastEventIdRef.current = event.lastEventId;
      } else if (data.id) {
        lastEventIdRef.current = data.id.toString();
      }

      const readNotifications = JSON.parse(
        localStorage.getItem("readNotifications") || "{}"
      );

      setNotifications((prev) => [
        {
          ...data,
          id: data.id,
          text: data.message,
          isRead: readNotifications[data.id] || false,
          time: formatNotificationTime(data.timestamp || Date.now()),
        },
        ...prev,
      ]);
    } catch (e) {
      console.warn("Error parsing notification:", e);
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

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || window.location.origin;
      console.log("Connecting to SSE at base URL:", baseUrl);

      const url = new URL("api/v1/notifications/subscribe", baseUrl);

      console.log("Full SSE URL:", url.toString());

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        withCredentials: true,
      };

      if (!isInitialFetchRef.current && lastEventIdRef.current) {
        headers["Last-Event-ID"] = lastEventIdRef.current;
      }

      eventSourceRef.current = new EventSourcePolyfill(url.toString(), {
        headers,
        withCredentials: true,
      });

      eventSourceRef.current.onopen = () => {
        console.log("SSE connection opened successfully");
        setIsConnected(true);
        setConnectionStatus("connected");
        connectionAttempts.current = 0;
      };

      eventSourceRef.current.onmessage = handleSSEMessage;

      eventSourceRef.current.onerror = async (error) => {
        console.error("SSE connection error details:", {
          status: error.status,
          message: error.message,
          type: error.type,
        });

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
        `${baseUrl}api/v1/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.status === 401) {
        token = await refreshToken();
        const retryResponse = await fetch(
          `${baseUrl}api/v1/notifications/${notificationId}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
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
