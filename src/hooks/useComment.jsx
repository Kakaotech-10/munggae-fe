import { useState } from "react";
import { editComment } from "../api/useEditComment";
import { deleteComment } from "../api/useDeleteComment";
import { replyComment } from "../api/useReplyComment";
import { createComment } from "../api/useCreateComment";

export const useCreateComment = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const handleCreateComment = async (
    postId,
    memberId,
    content,
    parentId = null,
    depth = 0
  ) => {
    if (!postId || !memberId || !content) {
      console.error("Missing required parameters in handleCreateComment:", {
        postId,
        memberId,
        content,
        parentId,
        depth,
      });
      throw new Error("Missing required parameters");
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const commentData = {
        memberId: Number(memberId),
        content: content.trim(),
        parentId: parentId ? Number(parentId) : null,
        depth: Number(depth),
      };

      console.log("Sending comment data:", { postId, commentData });
      const newComment = await createComment(Number(postId), commentData);
      setIsCreating(false);
      return newComment;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "댓글 작성 중 오류가 발생했습니다.";

      console.error("Comment creation error:", errorMessage);
      setCreateError(errorMessage);
      setIsCreating(false);
      throw error;
    }
  };

  return {
    handleCreateComment,
    isCreating,
    createError,
  };
};

// 댓글 수정 훅
export const useEditComment = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState(null);

  const handleEditComment = async (commentId, memberId, content) => {
    setIsEditing(true);
    setEditError(null);

    try {
      const updatedComment = await editComment(commentId, memberId, {
        content,
      });
      setIsEditing(false);
      return updatedComment;
    } catch (error) {
      setEditError(
        error.response?.data?.message || "댓글 수정 중 오류가 발생했습니다."
      );
      setIsEditing(false);
      throw error;
    }
  };

  return {
    handleEditComment,
    isEditing,
    editError,
  };
};

// 댓글 삭제 훅
export const useDeleteComment = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteComment = async (commentId, memberId) => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const success = await deleteComment(commentId, memberId);
      setIsDeleting(false);
      return success;
    } catch (error) {
      setDeleteError(
        error.response?.data?.message || "댓글 삭제 중 오류가 발생했습니다."
      );
      setIsDeleting(false);
      throw error;
    }
  };

  return {
    handleDeleteComment,
    isDeleting,
    deleteError,
  };
};

//대댓글 달기
export const useReplyComment = () => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplyComment = async (commentId, memberId, content) => {
    if (!commentId || !memberId || !content) {
      throw new Error("Missing required parameters");
    }

    setIsReplying(true);
    setReplyError(null);

    try {
      // ID들을 숫자로 변환
      const numCommentId = Number(commentId);
      const numMemberId = Number(memberId);

      if (isNaN(numCommentId) || isNaN(numMemberId)) {
        throw new Error("Invalid ID format");
      }

      const newReply = await replyComment(numCommentId, numMemberId, content);
      setIsReplying(false);
      setShowReplyForm(false);
      return newReply;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "답글 작성 중 오류가 발생했습니다.";

      setReplyError(errorMessage);
      setIsReplying(false);
      throw error;
    }
  };

  return {
    handleReplyComment,
    isReplying,
    replyError,
    showReplyForm,
    setShowReplyForm,
  };
};
