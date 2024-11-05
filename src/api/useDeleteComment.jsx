import api from "./config";

export const deleteCommentAPI = async (commentId) => {
  const memberId = localStorage.getItem("userId");
  if (!memberId) throw new Error("로그인이 필요합니다.");

  try {
    const response = await api.delete(`/api/v1/comments/${commentId}`, {
      params: { memberId: parseInt(memberId) },
    });

    // 성공적으로 삭제되었을 때만 true 반환
    return response.status === 204;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
