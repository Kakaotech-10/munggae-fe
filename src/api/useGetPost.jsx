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
      imageUrls: postData.cloudFrontPaths || [], // cloudFrontPath 사용
      s3ImageUrls: postData.s3ImagePaths || [], // s3ImagePaths 보관
      likes: (postData.likes !== undefined ? postData.likes : 0).toString(),
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

// useGetPosts.jsx
export const getPosts = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await api.get("/api/v1/posts", {
      params: {
        pageNo,
        pageSize,
      },
    });

    const transformedData = {
      content: response.data.content.map((post) => ({
        post_id: post.id,
        post_title: post.title,
        post_content: post.content,
        created_at: post.createdAt,
        updated_at: post.updatedAt,
        member: {
          member_id: post.member.id,
          member_name: post.member.name,
          member_name_english: post.member.nameEnglish,
          course: post.member.course,
          role: post.member.role,
        },
        // cloudFrontPaths 사용
        imageUrls: post.cloudFrontPaths || [],
        // 첫 번째 이미지를 대표 이미지로 사용
        mainImageUrl: post.cloudFrontPaths?.[0] || "",
        // S3 URL도 보관
        s3ImageUrls: post.s3ImagePaths || [],
      })),
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      size: response.data.size,
      number: response.data.number,
      first: response.data.first,
      last: response.data.last,
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: pageSize,
      number: pageNo,
      first: true,
      last: true,
    };
  }
};
