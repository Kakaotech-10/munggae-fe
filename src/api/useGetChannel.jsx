import { useState } from "react";
import api from "../api/config";

const useGetChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserChannels = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.log("No user ID found");
        setChannels([]);
        return;
      }

      const response = await api.get("/api/v1/channels", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      console.log("Channel API Response:", response.data);

      // 서버에서 이미 권한에 따라 필터링된 채널 목록을 반환하므로
      // 추가 처리 없이 바로 설정
      setChannels(response.data);
      setError(null);
    } catch (error) {
      console.error("Failed to load channels:", error);
      setError("채널 목록을 불러오는데 실패했습니다.");
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    channels,
    loading,
    error,
    loadUserChannels,
    setChannels,
  };
};

export default useGetChannels;
