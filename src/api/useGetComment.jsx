// api/commentService.js
import api from "./config";

export const getPostComments = async (postId) => {
  try {
    const response = await api.get("/comments", {
      params: {
        postId: postId,
      },
    });
    console.log("Raw API response for comments:", response.data);

    // Handle different response scenarios
    if (!response.data) {
      return { error: "댓글을 불러올 수 없습니다.", comments: [] };
    }

    if (response.data.code === "COM_001") {
      return { error: response.data.message, comments: [] };
    }

    // Transform comments data - response.data가 페이지네이션 객체임
    const comments = {
      content: response.data.content.map(transformCommentData),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      size: response.data.size,
      number: response.data.number,
    };

    // comments.content에 대해서만 계층 구조 조직
    comments.content = organizeComments(comments.content);

    return { error: null, comments };
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    const errorMessage =
      error.response?.status === 404
        ? "댓글을 찾을 수 없습니다."
        : error.response?.data?.message ||
          "댓글을 불러오는 중 오류가 발생했습니다.";

    return { error: errorMessage, comments: { content: [] } };
  }
};

const transformCommentData = (commentData) => {
  return {
    id: commentData.comment_id || commentData.id,
    postId: commentData.post_id || commentData.postId,
    parentId: commentData.parent_comment_id || commentData.parentId,
    content: commentData.comment_content || commentData.content,
    depth: commentData.depth || 0,
    createdAt: commentData.created_at || commentData.createdAt,
    updatedAt: commentData.updated_at || commentData.updatedAt,
    likes: commentData.likes || 0,
    member: {
      id: commentData.member?.member_id || commentData.member?.id,
      name: commentData.member?.member_name || commentData.member?.name,
      nameEnglish:
        commentData.member?.member_name_english ||
        commentData.member?.nameEnglish,
    },
  };
};

const organizeComments = (comments) => {
  const commentMap = new Map();
  const rootComments = [];

  // First pass: Create all comment objects
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: Organize into hierarchy
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id);

    if (comment.parentId && commentMap.has(comment.parentId)) {
      // This is a reply - add it to its parent's replies
      const parentComment = commentMap.get(comment.parentId);
      parentComment.replies.push(commentWithReplies);
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};
