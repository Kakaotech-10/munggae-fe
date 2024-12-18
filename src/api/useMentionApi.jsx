import { useCallback, useState } from "react";
import api from "../api/config"; // api import 추가

const useMentionApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  const searchUsers = useCallback(async (query) => {
    if (!query) return [];

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/v1/mentions/search", {
        params: {
          memberName: query,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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

  const sendMentionNotification = async (userFullName) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await api.post(
        "/api/v1/mentions",
        { name: userFullName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        }
      );

      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 401) {
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
