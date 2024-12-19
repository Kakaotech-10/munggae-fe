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

      // 상세 로깅 추가
      console.log("Original Channel Response:", response.data);

      // 중복 제거를 위해 Set 사용 (id 기준)
      const uniqueChannels = Array.from(
        new Map(response.data.map((channel) => [channel.id, channel])).values()
      );

      console.log("Processed Unique Channels:", uniqueChannels);

      setChannels(uniqueChannels);
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
