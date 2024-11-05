// src/api/useGetPosts.jsx
import api from "./config";

export const getPosts = async (pageNo = 0, pageSize = 10) => {
  try {
    const response = await api.get("/api/v1/posts", {
      params: {
        pageNo,
        pageSize,
      },
    });

    // API 응답을 데이터베이스 스키마에 맞게 변환
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
        imageUrls: post.imageUrls || [],
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
