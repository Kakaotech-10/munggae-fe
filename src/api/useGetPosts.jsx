// useGetPosts.jsx
import api from "../api/config";

export const getPosts = async (
  channelId,
  pageNo = 0,
  pageSize = 10,
  sortBy = "latest"
) => {
  try {
    const response = await api.get("/api/v1/posts", {
      params: {
        channelId,
        pageNo,
        pageSize,
        sort: sortBy,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    console.log("API Response:", response.data);

    // 응답 데이터 구조 확인 및 안전한 처리
    const responseData = response.data || {};
    const content = responseData.content || [];

    const transformedData = {
      content: Array.isArray(content)
        ? content.map((post) => {
            console.log("Individual post data:", post);

            // 이미지 URL 변환 - 안전한 접근
            const imageUrls = Array.isArray(post.imageUrls)
              ? post.imageUrls.map((img) => img?.path || "").filter(Boolean)
              : [];

            const memberImageUrl = post.member?.imageUrl?.path || "";

            return {
              post_id: post.id || 0,
              post_title: post.title || "",
              post_content: post.content || "",
              created_at: post.createdAt || new Date().toISOString(),
              updated_at: post.updatedAt || new Date().toISOString(),
              clean: post.clean ?? true,
              member: {
                member_id: post.member?.id || 0,
                member_name: post.member?.name || "",
                member_name_english: post.member?.nameEnglish || "",
                course: post.member?.course || "",
                role: post.member?.role || "",
                member_image: memberImageUrl,
              },
              imageUrls: imageUrls,
              thumbnailUrl: imageUrls[0] || "",
              post_likes: (post.likes || 0).toString(),
            };
          })
        : [],
      totalPages: responseData.totalPages || 0,
      totalElements: responseData.totalElements || 0,
      size: responseData.size || pageSize,
      number: responseData.number || pageNo,
      first: responseData.first ?? true,
      last: responseData.last ?? true,
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
