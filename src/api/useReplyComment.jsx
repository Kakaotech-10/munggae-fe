import api from "./config";

export const replyCommentAPI = async (commentId, content) => {
  const memberId = localStorage.getItem("userId");
  if (!memberId) throw new Error("로그인이 필요합니다.");

  try {
    console.log("Sending reply request:", { commentId, content }); // 로그 추가

    const response = await api.post(`/api/v1/comments/${commentId}`, {
      content,
    });

    console.log("Reply API response:", response.data); // 로그 추가

    return response.data;
  } catch (error) {
    console.error("Reply comment error:", error);
    throw error;
  }
};
