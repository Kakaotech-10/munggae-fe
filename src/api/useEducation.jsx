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

      console.log("Raw API Response:", response);

      // response.data가 없거나 유효하지 않은 경우 처리
      if (!response.data) {
        throw new Error("Invalid response data");
      }

      // response.data.data 또는 response.data 사용
      const postData = response.data.data || response.data;
      console.log("Processed Post Data:", postData);

      if (!postData) {
        throw new Error("No post data available");
      }

      // API 응답을 프론트엔드 데이터 구조로 변환
      return {
        id: postData.id,
        title: postData.title || "",
        content: postData.content || "",
        createdAt: postData.createdAt || new Date().toISOString(),
        updatedAt: postData.updatedAt || new Date().toISOString(),
        imageUrls: Array.isArray(postData.imageUrls)
          ? postData.imageUrls.map((img) => img.path || img)
          : [],
        likes: String(postData.likes || 0),
        clean: postData.clean || false,
        author: postData.member
          ? {
              id: postData.member.id,
              role: postData.member.role || "STUDENT",
              course: postData.member.course || "",
              name: postData.member.name || "",
              nameEnglish: postData.member.nameEnglish || "",
              profileImage:
                postData.member.imageUrl?.path ||
                postData.member.imageUrl ||
                "",
            }
          : null,
      };
    } catch (err) {
      console.error("Error fetching post:", err);
      if (err.response) {
        console.error("Error response:", {
          data: err.response.data,
          status: err.response.status,
          headers: err.response.headers,
        });
      }

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

  // 학습게시판 게시물 생성
  const createEducationPost = useCallback(async (postData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      // content와 codeArea를 ***** 구분자로 합치기
      const combinedContent =
        postData.content && postData.codeArea
          ? `${postData.content}*****${postData.codeArea}`
          : postData.content || "";

      const formData = new FormData();
      formData.append("title", postData.title || "");
      formData.append("content", combinedContent);

      if (postData.clean !== undefined) {
        formData.append("clean", postData.clean);
      }

      if (postData.files && postData.files.length > 0) {
        for (let i = 0; i < postData.files.length; i++) {
          formData.append("files", postData.files[i]);
        }
      }

      const response = await api.post("/api/v1/posts/education", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (err) {
      console.error("Create Education Post Error:", err);
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

  // 학습게시판 게시물 수정
  const updateEducationPost = useCallback(async (postId, updateData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      // content와 codeArea를 ***** 구분자로 합치기
      const combinedContent =
        updateData.content && updateData.codeArea
          ? `${updateData.content}*****${updateData.codeArea}`
          : updateData.content || "";

      const formData = new FormData();
      formData.append("title", updateData.title || "");
      formData.append("content", combinedContent);

      if (updateData.clean !== undefined) {
        formData.append("clean", updateData.clean);
      }

      if (updateData.files && updateData.files.length > 0) {
        for (let i = 0; i < updateData.files.length; i++) {
          formData.append("files", updateData.files[i]);
        }
      }

      const response = await api.put(
        `/api/v1/posts/education/${postId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (err) {
      console.error("Update Education Post Error:", err);
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

  // 학습게시판 게시물 삭제
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
      console.error("Delete Education Post Error:", err);
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

  // 전체 게시물 목록 조회 (필요한 경우 추가)
  const getEducationPosts = useCallback(async (params) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await api.get("/api/v1/posts/education", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return response.data;
    } catch (err) {
      console.error("Get Education Posts Error:", err);
      if (err.response?.status === 401) {
        setError("인증이 필요합니다.");
      } else {
        setError(
          err.response?.data?.message ||
            "게시물 목록 조회 중 오류가 발생했습니다."
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
    getEducationPosts,
    isLoading,
    error,
  };
};

export default useEducation;