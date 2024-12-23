import { useCallback, useState } from "react";
import api from "../api/config";

const useEducation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => localStorage.getItem("accessToken");

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
      // response 구조 확인
      console.log("Full Response:", response);
      console.log("Response Data:", response.data);
      // 만약 response.data.data 형태라면
      console.log("Actual Post Data:", response.data.data);
      if (!response.data) {
        throw new Error("Invalid response data");
      }

      const postData = response.data;

      // API 응답 형식 그대로 반환
      return {
        id: postData.id,
        title: postData.title || "",
        content: postData.content || "",
        codeArea: postData.codeArea || "",
        createdAt: postData.createdAt,
        updatedAt: postData.updatedAt,
        reservationTime: postData.reservationTime,
        deadLine: postData.deadLine,
        imageUrls: postData.imageUrls || [],
        likes: postData.likes || 0,
        member: postData.member && {
          id: postData.member.id,
          role: postData.member.role || "STUDENT",
          course: postData.member.course || "",
          name: postData.member.name || "",
          nameEnglish: postData.member.nameEnglish || "",
          imageUrl: postData.member.imageUrl,
        },
        clean: postData.clean,
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
      setError(
        err.response?.data?.message || "게시물을 불러오는데 실패했습니다."
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getEducationPost,
    isLoading,
    error,
  };
};

export default useEducation;
