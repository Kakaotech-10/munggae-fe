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

    console.log("API Response:", response.data);

    const transformedData = {
      content: response.data.content.map((post) => {
        console.log("Individual post data:", post);
        // imageUrls 처리 추가
        const imageUrls = post.imageUrls || post.cloudFrontPaths || [];
        return {
          post_id: post.id,
          post_title: post.title,
          post_content: post.content,
          created_at: post.createdAt,
          updated_at: post.updatedAt,
          clean: post.clean === undefined ? true : post.clean,
          member: {
            member_id: post.member.id,
            member_name: post.member.name,
            member_name_english: post.member.nameEnglish,
            course: post.member.course,
            role: post.member.role,
          },
          imageUrls: imageUrls, // 이미지 URL 배열 저장
          thumbnailUrl: imageUrls[0] || "", // 첫 번째 이미지를 썸네일로 사용
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

    console.log("Transformed data:", transformedData);
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
