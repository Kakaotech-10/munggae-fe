// useGetPost.jsx
import api from "./config";

export const getPost = async (postId) => {
  try {
    const response = await api.get(`/api/v1/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    console.log("API Response:", response);
    const postData = response.data;

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

    // 이미지 URL 변환
    const imageUrls = postData.imageUrls?.map((img) => img.path) || [];
    const memberImageUrl = postData.member.imageUrl?.path || "";

    // API 응답을 프론트엔드 데이터 구조로 변환
    return {
      id: postData.id,
      title: postData.title,
      content: postData.content,
      createdAt: postData.createdAt,
      updatedAt: postData.updatedAt,
      reservationTime: postData.reservationTime,
      deadLine: postData.deadLine,
      imageUrls: imageUrls,
      likes: (postData.likes !== undefined ? postData.likes : 0).toString(),
      clean: postData.clean,
      author: {
        id: postData.member.id,
        role: postData.member.role,
        course: postData.member.course,
        name: postData.member.name,
        nameEnglish: postData.member.nameEnglish,
        profileImage: memberImageUrl,
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
