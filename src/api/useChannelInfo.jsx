import { useState, useEffect } from "react";
import api from "../api/config";

const useChannelInfo = (channelId) => {
  // localStorage에서 초기 상태 로드
  const [channelInfo, setChannelInfo] = useState(() => {
    const savedInfo = localStorage.getItem("channelInfo");
    return savedInfo ? JSON.parse(savedInfo) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadChannelInfo = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/channels/${channelId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          Accept: "application/json;charset=UTF-8",
        },
      });

      console.log("Channel Info Response:", response.data);

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      // API 응답 데이터를 state와 localStorage 모두에 저장
      setChannelInfo(response.data);
      localStorage.setItem("channelInfo", JSON.stringify(response.data));
      setError(null);
    } catch (error) {
      console.error("Failed to load channel info:", error);
      setError("채널 정보를 불러오는데 실패했습니다.");
      localStorage.removeItem("channelInfo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channelId) {
      loadChannelInfo();
    }
  }, [channelId]);

  return {
    channelInfo,
    isLoading,
    error,
    loadChannelInfo,
  };
};

export default useChannelInfo;
