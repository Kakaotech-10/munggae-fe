// api/useGetCommentDetail.jsx
import api from "./config";

export const getCommentDetail = async (commentId) => {
  try {
    const response = await api.get(`/api/v1/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comment detail:", error);
    throw error;
  }
};
