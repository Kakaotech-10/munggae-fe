// api/useCreateComment.js
import api from "./config";

export const createComment = async (postId, commentData) => {
  try {
    const response = await api.post(`/comments`, {
      post_id: postId,
      member_id: commentData.memberId,
      parent_comment_id: commentData.parentId || null,
      comment_content: commentData.content,
      depth: commentData.depth || 0,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};
