// api/useCreateComment.js
import api from "./config";

export const createCommentAPI = async (postId, commentData) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("로그인이 필요합니다.");
    }

    // Authorization 헤더 설정
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        postId: postId,
      },
    };

    const response = await api.post(
      "/api/v1/comments",
      {
        memberId: commentData.memberId,
        content: commentData.content,
        parentId: commentData.parentId,
        depth: commentData.depth,
      },
      config
    );

    // 응답 데이터 포맷팅
    return {
      id: response.data.id,
      content: response.data.content,
      createdAt: response.data.createdAt,
      parentId: response.data.parentId,
      depth: response.data.depth,
      member: {
        id: commentData.memberId,
        name: localStorage.getItem("memberName"),
        nameEnglish: localStorage.getItem("memberNameEnglish"),
      },
    };
  } catch (error) {
    console.error("Error in createCommentAPI:", error);
    if (error.response?.status === 401) {
      throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }
    throw error;
  }
};
