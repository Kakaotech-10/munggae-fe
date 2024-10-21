import api from "./config";

export const getPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);

    // Log the entire response for debugging
    console.log("API Response:", response);

    // Validate the response structure
    const data = response.data;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format");
    }

    console.log("Received data:", data);

    // Check if the data is nested inside a 'data' property
    const postData = data.data || data;

    // Log the structure of the data
    console.log("Post data structure:", Object.keys(postData));

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
      if (!(field in postData)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate member object
    const memberFields = ["id", "role", "course", "name", "nameEnglish"];
    for (const field of memberFields) {
      if (!(field in postData.member)) {
        throw new Error(`Missing required member field: ${field}`);
      }
    }

    // Transform the data to match our expected structure
    return {
      id: postData.id,
      title: postData.title,
      content: postData.content,
      createdAt: postData.createdAt,
      updatedAt: postData.updatedAt,
      imageUrl: "", // 빈 문자열로 설정
      likes: (postData.likes !== undefined ? postData.likes : 0).toString(),
      author: {
        id: postData.member.id,
        role: postData.member.role,
        course: postData.member.course,
        name: postData.member.name,
        nameEnglish: postData.member.nameEnglish,
        profileImage: "", // 빈 문자열로 설정
      },
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    console.error(
      "Error details:",
      error.response ? error.response.data : "No response data"
    );
    throw error;
  }
};
