import { EventSourcePolyfill } from "event-source-polyfill";
import { useState, useEffect, useRef } from "react";

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
      console.log("Setting up SSE connection...");
      setConnectionStatus("connecting");
      let token = localStorage.getItem("accessToken");

      if (!token) {
        token = await refreshToken();
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = new URL("/api/v1/notifications/subscribe", baseUrl);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };

      const eventSource = new EventSourcePolyfill(url.toString(), {
        headers,
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
          const message = event.data; // 서버에서 보낸 문자열 메시지

          // 새 알림 객체 생성
          const newNotification = {
            id: event.lastEventId || Date.now().toString(), // 이벤트 ID 또는 타임스탬프
            text: message, // 서버에서 받은 메시지 그대로 사용
            message: message, // 서버 메시지
            timestamp: new Date().toISOString(),
            type: "NOTIFICATION",
            isRead: false,
            time: "방금 전", // 새 알림이므로 "방금 전"으로 표시
          };

          // 상태 업데이트 - 새 알림을 맨 앞에 추가
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
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      let token = localStorage.getItem("accessToken");

      if (!token) {
        token = await refreshToken();
      }

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
          console.error(
            `Failed to mark notification ${notificationId} as read on server`
          );
        }
      } else if (!response.ok) {
        console.error(
          `Failed to mark notification ${notificationId} as read on server`
        );
      }
    } catch (error) {
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
