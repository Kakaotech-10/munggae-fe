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
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("알림 전송에 실패했습니다");
      }

      alert("테스트 알림이 성공적으로 전송되었습니다.");
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
      {isLoading ? "전송 중..." : "테스트 알림 보내기"}
    </button>
  );
};

export default NotificationTestButton;
