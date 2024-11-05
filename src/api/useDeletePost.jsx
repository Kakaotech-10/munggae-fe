// api/useDeletePost.js
import api from "./config";

export const deletePost = async (postId, memberId) => {
  try {
    await api.delete(`/api/v1/posts/${postId}`, {
      params: {
        memberId: memberId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};
