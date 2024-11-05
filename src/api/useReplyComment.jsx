import api from "./config";
export const replyCommentAPI = async (commentId, content) => {
  const memberId = localStorage.getItem("userId");
  if (!memberId) throw new Error("로그인이 필요합니다.");

  const response = await api.post(`/api/v1/comments/${commentId}`, {
    content,
    memberId: parseInt(memberId),
  });

  return {
    ...response.data,
    member: {
      id: parseInt(memberId),
      name: localStorage.getItem("memberName"),
      nameEnglish: localStorage.getItem("memberNameEnglish"),
    },
  };
};
