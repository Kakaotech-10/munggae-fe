import { useCallback, useState } from "react";
import api from "../api/config";

const useEducation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  // 학습게시판 게시물 조회
  const getEducationPost = useCallback(async (postId) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await api.get(`/api/v1/posts/education/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err) {
      console.error("Education Post API Error:", err.response || err);
      if (err.response?.status === 401) {
        setError("인증이 필요합니다.");
      } else if (err.response?.status === 404) {
        setError("게시물을 찾을 수 없습니다.");
      } else {
        setError(
          err.response?.data?.message || "게시물 조회 중 오류가 발생했습니다."
        );
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 학습게시판 게시물 생성 (예시)
  const createEducationPost = useCallback(async (postData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await api.post("/api/v1/posts/education", postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (err) {
      console.error("Create Education Post Error:", err.response || err);
      if (err.response?.status === 401) {
        setError("인증이 필요합니다.");
      } else {
        setError(
          err.response?.data?.message || "게시물 생성 중 오류가 발생했습니다."
        );
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 학습게시판 게시물 수정 (예시)
  const updateEducationPost = useCallback(async (postId, updateData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await api.put(
        `/api/v1/posts/education/${postId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (err) {
      console.error("Update Education Post Error:", err.response || err);
      if (err.response?.status === 401) {
        setError("인증이 필요합니다.");
      } else if (err.response?.status === 404) {
        setError("게시물을 찾을 수 없습니다.");
      } else {
        setError(
          err.response?.data?.message || "게시물 수정 중 오류가 발생했습니다."
        );
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 학습게시판 게시물 삭제 (예시)
  const deleteEducationPost = useCallback(async (postId) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await api.delete(`/api/v1/posts/education/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err) {
      console.error("Delete Education Post Error:", err.response || err);
      if (err.response?.status === 401) {
        setError("인증이 필요합니다.");
      } else if (err.response?.status === 404) {
        setError("게시물을 찾을 수 없습니다.");
      } else {
        setError(
          err.response?.data?.message || "게시물 삭제 중 오류가 발생했습니다."
        );
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getEducationPost,
    createEducationPost,
    updateEducationPost,
    deleteEducationPost,
    isLoading,
    error,
  };
};

export default useEducation;
