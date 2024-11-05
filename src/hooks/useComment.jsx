import { useState } from "react";
import { editCommentAPI } from "../api/useEditComment";
import { deleteCommentAPI } from "../api/useDeleteComment";
import { replyCommentAPI } from "../api/useReplyComment";
import { createCommentAPI } from "../api/useCreateComment";

const validateContent = (content) => {
  if (!content || typeof content !== "string") {
    throw new Error("댓글 내용이 유효하지 않습니다.");
  }

  const trimmedContent = String(content).trim();
  if (!trimmedContent) {
    throw new Error("댓글 내용을 입력해주세요.");
  }

  return trimmedContent;
};

export const useCreateComment = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // useComment.jsx의 handleCreateComment 수정
  const handleCreateComment = async (
    postId,
    memberId,
    content,
    parentId = null
  ) => {
    if (!postId || !memberId) {
      throw new Error("필수 정보가 누락되었습니다.");
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      const commentData = {
        postId: Number(postId),
        memberId: Number(memberId),
        content: content.trim(),
        parentId: parentId ? Number(parentId) : null,
        // depth는 서버에서 자동으로 설정되므로 제거
      };

      console.log("Creating comment with data:", commentData);

      const newComment = parentId
        ? await replyCommentAPI(parentId, content)
        : await createCommentAPI(postId, commentData);

      console.log("API Response:", newComment);

      return newComment;
    } catch (error) {
      console.error("Comment creation error:", error);
      setCreateError(error.message || "댓글 작성 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return { handleCreateComment, isCreating, createError };
};

export const useEditComment = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState(null);

  const handleEditComment = async (commentId, content) => {
    try {
      setIsEditing(true);
      setEditError(null);

      const validContent = validateContent(content);
      const result = await editCommentAPI(commentId, validContent);

      return result;
    } catch (error) {
      console.error("Comment edit error:", error);
      setEditError(error.message || "댓글 수정 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsEditing(false);
    }
  };

  return { handleEditComment, isEditing, editError };
};

export const useDeleteComment = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteComment = async (commentId) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      return await deleteCommentAPI(commentId);
    } catch (error) {
      console.error("Comment deletion error:", error);
      setDeleteError(error.message || "댓글 삭제 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return { handleDeleteComment, isDeleting, deleteError };
};

export const useReplyComment = () => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplyComment = async (commentId, content) => {
    try {
      setIsReplying(true);
      setReplyError(null);

      const validContent = validateContent(content);
      const reply = await replyCommentAPI(commentId, validContent);

      setShowReplyForm(false);
      return reply;
    } catch (error) {
      console.error("Comment reply error:", error);
      setReplyError(error.message || "답글 작성 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsReplying(false);
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
