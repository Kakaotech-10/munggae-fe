// api/useEditPost.js
import api from "./config";

export const editPost = async (postId, memberId, postData) => {
  try {
    const response = await api.put(
      `/api/v1/posts/${postId}`,
      {
        title: postData.title,
        content: postData.content,
      },
      {
        params: {
          memberId: memberId,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing post:", error);
    throw error;
  }
};
