// useGetPost.jsx
import api from "./config";

export const getPost = async (postId) => {
  try {
    const response = await api.get(`/api/v1/posts/${postId}`);
    console.log("API Response:", response);

    const data = response.data;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format");
    }

    console.log("Received data:", data);
    const postData = data.data || data;
    console.log("Post data structure:", Object.keys(postData));

    // 필수 필드 검증
    const requiredFields = [
      "id",
      "title",
      "content",
      "createdAt",
      "updatedAt",
      "member",
      "clean", // clean 필드로 수정
    ];

    for (const field of requiredFields) {
      if (!(field in postData)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // member 객체 검증
    const memberFields = ["id", "role", "course", "name", "nameEnglish"];
    for (const field of memberFields) {
      if (!(field in postData.member)) {
        throw new Error(`Missing required member field: ${field}`);
      }
    }

    return {
      id: postData.id,
      title: postData.title,
      content: postData.content,
      createdAt: postData.createdAt,
      updatedAt: postData.updatedAt,
      imageUrls: postData.cloudFrontPaths || [],
      s3ImageUrls: postData.s3ImagePaths || [],
      likes: (postData.likes !== undefined ? postData.likes : 0).toString(),
      clean: postData.clean, // clean 필드로 수정
      author: {
        id: postData.member.id,
        role: postData.member.role,
        course: postData.member.course,
        name: postData.member.name,
        nameEnglish: postData.member.nameEnglish,
        profileImage: postData.member.profileImage || "",
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
