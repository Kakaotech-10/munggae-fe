// api/useCreatePost.js
import api from "./config";

export const createPost = async (postData) => {
  try {
    const response = await api.post(
      "/posts",
      {
        title: postData.title,
        content: postData.content,
      },
      {
        params: {
          memberId: postData.memberId,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};
