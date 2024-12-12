import api from "./config";

export const getPosts = async (pageNo = 0, pageSize = 10, channelId = null) => {
  try {
    const params = {
      pageNo,
      pageSize,
    };

    // Channel 에 대한 설정
    if (channelId) {
      params.channelId = channelId;
    }

    const response = await api.get("/api/v1/posts", {
      params: params,
    });

    console.log("API Response:", response.data);

    const transformedData = {
      content: response.data.content.map((post) => {
        console.log("Individual post data:", post);

        // 새로운 이미지 URL 구조 처리
        const imageUrls = post.imageUrls?.map((img) => img.path) || [];

        // 멤버 이미지 처리
        const memberImageUrl = post.member.imageUrl?.path || "";

        return {
          post_id: post.id,
          post_title: post.title,
          post_content: post.content,
          created_at: post.createdAt,
          updated_at: post.updatedAt,
          clean: post.clean === undefined ? true : post.clean,
          channel_id: post.channelId, // Add channel ID to the transformed data
          member: {
            member_id: post.member.id,
            member_name: post.member.name,
            member_name_english: post.member.nameEnglish,
            course: post.member.course,
            role: post.member.role,
            member_image: memberImageUrl,
          },
          imageUrls: imageUrls,
          thumbnailUrl: imageUrls[0] || "",
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
