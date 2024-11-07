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

    console.log("API Response:", response.data); // API 응답 로깅 추가

    const transformedData = {
      content: response.data.content.map((post) => {
        console.log("Individual post data:", post); // 개별 게시물 데이터 로깅
        return {
          post_id: post.id,
          post_title: post.title,
          post_content: post.content,
          created_at: post.createdAt,
          updated_at: post.updatedAt,
          clean: post.clean === undefined ? true : post.clean, // clean 필드 처리 수정
          member: {
            member_id: post.member.id,
            member_name: post.member.name,
            member_name_english: post.member.nameEnglish,
            course: post.member.course,
            role: post.member.role,
          },
          imageUrls: post.cloudFrontPaths || [],
          mainImageUrl: post.cloudFrontPaths?.[0] || "",
          s3ImageUrls: post.s3ImagePaths || [],
          likes: post.likes?.toString() || "0",
        };
      }),
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      size: response.data.size,
      number: response.data.number,
      first: response.data.first,
      last: response.data.last,
    };

    console.log("Transformed data:", transformedData); // 변환된 데이터 로깅

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
