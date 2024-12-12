import api from "./config";

export const createPost = async (postData) => {
  // Check if channelId is provided
  if (!postData.channelId) {
    throw new Error("channelId is required to create a post");
  }

  try {
    const response = await api.post(
      "/api/v1/posts",
      {
        title: postData.title,
        content: postData.content,
      },
      {
        params: {
          channelId: postData.channelId, // Required channel ID
          memberId: postData.memberId, // Keeping existing memberId if needed
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};
