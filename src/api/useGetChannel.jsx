import { useState, useEffect } from "react";
import api from "../api/config";

const useGetChannels = () => {
  // channels를 빈 배열로 초기화
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true); // 초기값을 true로 설정
  const [error, setError] = useState(null);

  const loadUserChannels = async () => {
    if (!localStorage.getItem("accessToken")) {
      console.log("No access token found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/api/v1/channels", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      console.log("Channel API Response:", response.data);

      if (!response.data) {
        setChannels([]);
        return;
      }

      // 응답이 배열인지 확인하고 안전하게 처리
      const channelData = Array.isArray(response.data) ? response.data : [];
      setChannels(channelData);
      setError(null);
    } catch (error) {
      console.error("Failed to load channels:", error);
      setError("채널 목록을 불러오는데 실패했습니다.");
      setChannels([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 자동으로 채널 로드
  useEffect(() => {
    loadUserChannels();
  }, []);

  return {
    channels,
    loading,
    error,
    loadUserChannels,
  };
};

export default useGetChannels;
