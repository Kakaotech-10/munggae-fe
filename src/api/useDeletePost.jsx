import api from "./config";

export const deletePost = async (postId, memberId) => {
  try {
    await api.delete(`/posts/${postId}?memberId=${memberId}`);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};
