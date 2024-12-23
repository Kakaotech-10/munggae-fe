import { useCallback, useState } from "react";
import api from "../api/config";

const useEducation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  // 학습 게시물 상세 조회
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

      if (!response.data) {
        throw new Error("Invalid response data");
      }

      const postData = response.data.data || response.data;

      // content가 없는 경우 예외 처리
      if (!postData) {
        throw new Error("No post data available");
      }

      // content와 codeArea 분리
      let content = postData.content || "";
      let codeArea = "";

      if (content.includes("*****")) {
        const [mainContent, code] = content.split("*****");
        content = mainContent;
        codeArea = code;
      }

      return {
        id: postData.id,
        title: postData.title || "",
        content: content.trim(),
        codeArea: codeArea.trim(),
        createdAt: postData.createdAt || new Date().toISOString(),
        updatedAt: postData.updatedAt || new Date().toISOString(),
        imageUrls: Array.isArray(postData.imageUrls)
          ? postData.imageUrls.map((img) => img.path || img)
          : [],
        likes: String(postData.likes || 0),
        member: postData.member,
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

  // 전체 게시물 목록 조회
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
