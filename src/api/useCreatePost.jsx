import api from "./config";

export const createPost = async (postData, memberId) => {
  try {
    const response = await api.post(`/posts?memberId=${memberId}`, postData);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};
