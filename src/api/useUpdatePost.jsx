import api from "./config";

export const updatePost = async (postId, postData, memberId) => {
  try {
    const response = await api.put(
      `/api/v1/posts/${postId}?memberId=${memberId}`,
      postData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};
