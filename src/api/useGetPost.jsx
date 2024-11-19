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
      "clean",
      "imageUrls",
    ];

    for (const field of requiredFields) {
      if (!(field in postData)) {
        console.warn(`Missing field in response: ${field}`);
      }
    }

    // member 객체 검증
    const memberFields = [
      "id",
      "role",
      "course",
      "name",
      "nameEnglish",
      "imageUrl",
    ];
    for (const field of memberFields) {
      if (!(field in postData.member)) {
        console.warn(`Missing member field: ${field}`);
      }
    }

    // 이미지 URL 배열 변환
    const imageUrls = postData.imageUrls?.map((img) => img.path) || [];

    // 멤버 이미지 URL 처리
    const memberImageUrl = postData.member.imageUrl?.path || "";

    // API 응답을 프론트엔드 데이터 구조로 변환
    return {
      id: postData.id,
      title: postData.title,
      content: postData.content,
      createdAt: postData.createdAt,
      updatedAt: postData.updatedAt,
      imageUrls: imageUrls, // 변환된 이미지 URL 배열
      likes: (postData.likes !== undefined ? postData.likes : 0).toString(),
      clean: postData.clean,
      author: {
        id: postData.member.id,
        role: postData.member.role,
        course: postData.member.course,
        name: postData.member.name,
        nameEnglish: postData.member.nameEnglish,
        profileImage: memberImageUrl, // 멤버 프로필 이미지 URL
      },
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw new Error(`Failed to fetch post: ${error.message}`);
  }
};
