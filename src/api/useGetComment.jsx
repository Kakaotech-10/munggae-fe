// api/commentService.js
import api from "./config";

// api/commentService.js
export const getPostComments = async (postId) => {
  try {
    const response = await api.get("/api/v1/comments", {
      params: {
        postId: postId,
      },
    });
    console.log("Raw API response for comments:", response.data);

    if (!response.data) {
      return { error: "댓글을 불러올 수 없습니다.", comments: [] };
    }

    if (response.data.code === "COM_001") {
      return { error: response.data.message, comments: [] };
    }

    // Transform comments data
    const commentsData = response.data.content;

    // 모든 댓글을 먼저 변환
    const transformedComments = commentsData.map(transformCommentData);

    // 댓글 맵 생성 (빠른 조회를 위해)
    const commentMap = new Map();
    transformedComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // 최종 결과 배열
    const result = [];

    // 댓글들을 순회하면서 부모-자식 관계 설정
    transformedComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);

      if (comment.parentId) {
        // 대댓글인 경우
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies.push(commentWithReplies);
        }
      } else {
        // 루트 댓글인 경우
        result.push(commentWithReplies);
      }
    });

    // 결과 정렬 (최신순)
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const comments = {
      content: result,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      size: response.data.size,
      number: response.data.number,
    };

    console.log("Transformed comments with replies:", comments);
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

// transformCommentData 함수도 약간 수정
const transformCommentData = (commentData) => ({
  id: commentData.id,
  postId: commentData.postId,
  parentId: commentData.parentId,
  content: commentData.content,
  depth: commentData.depth,
  createdAt: commentData.createdAt,
  updatedAt: commentData.updatedAt,
  member: {
    id: commentData.member.id,
    name: commentData.member.name,
    nameEnglish: commentData.member.nameEnglish,
  },
  replies: [], // 초기 replies 배열 추가
});
