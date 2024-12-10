import { useCallback, useState } from "react";
import axios from "axios";

const useMentionApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // JWT 토큰 가져오기
  const getAuthToken = () => {
    return localStorage.getItem("accessToken"); // 또는 프로젝트에서 사용하는 토큰 저장소
  };

  // axios 설정
  const axiosInstance = axios.create({
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 요청 인터셉터 추가
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

  // 사용자 검색 API
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

      return response.data.result.map((name) => ({
        id: name,
        display: name,
      }));
    } catch (err) {
      console.error("Search API Error:", err.response || err);
      if (err.response?.status === 401) {
        setError("인증이 필요합니다.");
        // 필요한 경우 로그인 페이지로 리다이렉트
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
  const sendMentionNotification = async (mentionedUserId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      await axios.post(
        `${baseUrl}/api/v1/mentions`,
        { name: mentionedUserId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return true;
    } catch (error) {
      console.error("멘션 알림 전송 실패:", error);
      throw error;
    }
  };

  // react-mentions용 데이터 fetcher
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
