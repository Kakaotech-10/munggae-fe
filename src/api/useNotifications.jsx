import { EventSourcePolyfill } from "event-source-polyfill";
import { useState, useEffect, useRef } from "react";
import api from "../api/config";

const MAX_RETRIES = 5;

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const eventSourceRef = useRef(null);
  const connectionAttempts = useRef(0);
  const lastEventIdRef = useRef(null);

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
      const { data } = await api.post("/api/v1/auth/refresh");
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
      const { data } = await api.get("/api/v1/notifications/me", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        await refreshToken();
        return fetchNotifications();
      }
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
      lastEventIdRef.current = notificationsArray[0].id.toString();
    }
  };

  const setupSSEConnection = async () => {
    cleanup();

    try {
      console.log("Setting up SSE connection...");
      setConnectionStatus("connecting");

      let token = localStorage.getItem("accessToken");
      if (!token) {
        token = await refreshToken();
      }

      const url = new URL(
        "/api/v1/notifications/subscribe",
        import.meta.env.VITE_API_BASE_URL
      );

      const eventSource = new EventSourcePolyfill(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        heartbeatTimeout: 300000,
        withCredentials: true,
      });

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection established");
        setIsConnected(true);
        setConnectionStatus("connected");
        connectionAttempts.current = 0;
      };

      eventSource.addEventListener("notification", (event) => {
        console.log("Notification received:", event);
        try {
          const message = event.data;

          const newNotification = {
            id: event.lastEventId || Date.now().toString(),
            text: message,
            message: message,
            timestamp: new Date().toISOString(),
            type: "NOTIFICATION",
            isRead: false,
            time: "방금 전",
          };

          setNotifications((prev) => [newNotification, ...prev]);
        } catch (error) {
          console.error("Error processing notification:", error);
        }
      });

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("Connection was closed, attempting to reconnect...");
          cleanup();

          setTimeout(() => {
            if (connectionAttempts.current < MAX_RETRIES) {
              connectionAttempts.current++;
              setupSSEConnection();
            } else {
              setConnectionStatus("failed");
            }
          }, 5000);
        }
      };
    } catch (error) {
      console.error("Failed to setup SSE connection:", error);
      setConnectionStatus("error");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      const readNotifications = JSON.parse(
        localStorage.getItem("readNotifications") || "{}"
      );
      readNotifications[notificationId] = true;
      localStorage.setItem(
        "readNotifications",
        JSON.stringify(readNotifications)
      );

      await api.patch(`/api/v1/notifications/${notificationId}/read`, null, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
    } catch (error) {
      if (error.response?.status === 401) {
        await refreshToken();
        return markAsRead(notificationId);
      }
      console.error(
        `Error marking notification ${notificationId} as read:`,
        error
      );
    }
  };

  const markAllAsRead = async () => {
    const readNotifications = JSON.parse(
      localStorage.getItem("readNotifications") || "{}"
    );

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
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
          continue;
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
      if (!isActive) return;

      try {
        const data = await fetchNotifications();
        if (isActive) {
          updateNotificationsState(data);
        }

        if (isActive) {
          await setupSSEConnection();
        }
      } catch (error) {
        console.error("알림 초기화 실패:", error);
        if (isActive) {
          setConnectionStatus("failed");
        }
      }
    };

    initialize();

    const intervalId = setInterval(() => {
      if (eventSourceRef.current?.readyState !== 1) {
        console.log("SSE 연결 끊김, 재연결 시도...");
        setupSSEConnection();
      }
    }, 30000);

    return () => {
      isActive = false;
      cleanup();
      clearInterval(intervalId);
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
