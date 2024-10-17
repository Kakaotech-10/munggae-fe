import api from "./config";
export const getPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);

    // Validate the response structure
    const data = response.data;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format");
    }

    // Validate required fields
    const requiredFields = [
      "id",
      "title",
      "content",
      "createdAt",
      "updatedAt",
      "member",
    ];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate member object
    const memberFields = ["id", "role", "course", "name", "nameEnglish"];
    for (const field of memberFields) {
      if (!(field in data.member)) {
        throw new Error(`Missing required member field: ${field}`);
      }
    }

    return data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};
