import api from "./config";

export const getComment = async (commentId) => {
  try {
    const response = await api.get(`/comments/${commentId}`);

    // Log the entire response for debugging
    console.log("API Response:", response);

    // Validate the response structure
    const data = response.data;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format");
    }

    console.log("Received data:", data);

    // Check if the data is nested inside a 'data' property
    const commentData = data.data || data;

    // Log the structure of the data
    console.log("Comment data structure:", Object.keys(commentData));

    // Validate required fields
    const requiredFields = [
      "comment_id",
      "post_id",
      "member_id",
      "comment_content",
      "depth",
      "created_at",
      "updated_at",
      "member",
    ];

    for (const field of requiredFields) {
      if (!(field in commentData)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate member object
    const memberFields = [
      "member_id",
      "role",
      "course",
      "member_name",
      "member_name_english",
    ];
    for (const field of memberFields) {
      if (!(field in commentData.member)) {
        throw new Error(`Missing required member field: ${field}`);
      }
    }

    // Transform the data to match our expected structure
    return {
      id: commentData.comment_id,
      postId: commentData.post_id,
      parentId: commentData.parent_comment_id || null,
      content: commentData.comment_content,
      depth: commentData.depth,
      createdAt: commentData.created_at,
      updatedAt: commentData.updated_at,
      member: {
        id: commentData.member.member_id,
        role: commentData.member.role,
        course: commentData.member.course,
        name: commentData.member.member_name,
        nameEnglish: commentData.member.member_name_english,
      },
      // 대댓글 정보는 별도의 API 호출이 필요할 수 있습니다.
      replies: [],
    };
  } catch (error) {
    console.error("Error fetching comment:", error);
    console.error(
      "Error details:",
      error.response ? error.response.data : "No response data"
    );
    throw error;
  }
};
