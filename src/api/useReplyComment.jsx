import api from "./config";

export const replyComment = async (commentId, memberId, content) => {
  try {
    // memberId와 commentId가 유효한 숫자인지 확인
    if (!commentId || !memberId) {
      throw new Error("Invalid commentId or memberId");
    }

    // URL에 쿼리 파라미터를 명시적으로 포함
    const response = await api.post(
      `/comments/${commentId}?memberId=${memberId}`,
      { content }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating reply:", error);
    throw error;
  }
};
