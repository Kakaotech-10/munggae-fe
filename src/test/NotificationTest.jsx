import { useState } from "react";

const NotificationTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendTestNotification = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/notifications/publish", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("알림 전송에 실패했습니다");
      }

      // 수동으로 알림 이벤트 생성
      const notificationEvent = new MessageEvent("message", {
        data: JSON.stringify({
          id: Date.now(),
          message: "테스트 알림입니다.",
          timestamp: new Date().toISOString(),
          isRead: false,
        }),
      });

      // EventSource의 onmessage 핸들러 호출
      if (window.eventSource && window.eventSource.onmessage) {
        window.eventSource.onmessage(notificationEvent);
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={sendTestNotification}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isLoading ? "전송 중..." : "테스트"}
    </button>
  );
};

export default NotificationTestButton;
