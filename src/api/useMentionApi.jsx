// useMentionApi.js
import { useCallback, useState } from "react";
import axios from "axios";

const useMentionApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  const axiosInstance = axios.create({
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const searchUsers = useCallback(async (query) => {
    if (!query) return [];

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/api/v1/mentions/search", {
        params: {
          memberName: query,
        },
      });

      // API 응답에서 받은 사용자 정보를 react-mentions에 맞는 형식으로 변환
      return response.data.result.map((name) => ({
        id: name, // API 응답의 전체 이름을 id로 사용
        display: name, // 화면에 표시될 이름
      }));
    } catch (err) {
      console.error("Search API Error:", err.response || err);
      if (err.response?.status === 401) {
        setError("인증이 필요합니다.");
      } else {
        setError(
          err.response?.data?.message || "사용자 검색 중 오류가 발생했습니다."
        );
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 멘션 알림 전송 API
  const sendMentionNotification = async (userFullName) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios({
        method: "post",
        url: `${baseUrl}/api/v1/mentions`,
        data: { name: userFullName },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000, // 5초 타임아웃 설정
      });

      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 401) {
        // 토큰 만료 시 처리
        console.error("인증 토큰이 만료되었습니다.");
      }
      throw error;
    }
  };

  const fetchUsers = useCallback(
    (query, callback) => {
      searchUsers(query)
        .then(callback)
        .catch((err) => {
          console.error("Fetch users error:", err);
          callback([]);
        });
    },
    [searchUsers]
  );

  return {
    fetchUsers,
    sendMentionNotification,
    isLoading,
    error,
  };
};

export default useMentionApi;
