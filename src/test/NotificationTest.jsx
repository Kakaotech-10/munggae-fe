import { useState } from "react";

const NotificationTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendTestNotification = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${baseUrl}/api/v1/notifications/publish`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          "If-None-Match": new Date().getTime().toString(), // 캐싱 방지
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("알림 전송에 실패했습니다");
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
