import { useState, useEffect } from "react";

// SSE 연결을 관리하고 알림을 처리하는 커스텀 훅
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [eventSource, setEventSource] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // SSE 연결 설정
    const setupSSE = () => {
      const sse = new EventSource("/notifications/subscribe");

      // 연결 성공 이벤트 핸들러
      sse.addEventListener("connect_success", (event) => {
        console.log("SSE Connection established:", event.data);
        setIsConnected(true);
      });

      // 알림 이벤트 핸들러
      sse.addEventListener("notification", (event) => {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [
          {
            id: newNotification.id || Date.now(),
            text: newNotification.message,
            isRead: false,
            time: "방금 전",
            ...newNotification,
          },
          ...prev,
        ]);
      });

      // 에러 핸들러
      sse.onerror = (error) => {
        console.error("SSE connection error:", error);
        setIsConnected(false);
        sse.close();
        // 연결 재시도 로직
        setTimeout(setupSSE, 5000);
      };

      setEventSource(sse);
    };

    setupSSE();

    // 컴포넌트 언마운트시 연결 정리
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // 알림 읽음 처리 함수
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  // 알림 삭제 함수
  const removeNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  // 알림 시간 포매팅 함수
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  return {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    formatNotificationTime,
  };
};
