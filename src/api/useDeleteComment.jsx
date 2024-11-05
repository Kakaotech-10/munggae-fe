import api from "./config";

export const deleteComment = async (commentId, memberId) => {
  try {
    const response = await api.delete("/api/v1/comments/${commentId}", {
      params: { memberId },
    });
    return response.status === 204;
  } catch (error) {
    console.error("Error deleting comment", error);
    throw error;
  }
};
