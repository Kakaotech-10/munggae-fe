import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { MoreHorizontal } from "lucide-react";
import CommentInput from "../component/CommentInput";
import {
  useEditComment,
  useDeleteComment,
  useCreateComment,
} from "../hooks/useComment";
import "./styles/Comment.scss";

const Comment = ({
  comment,
  depth,
  currentUserId,
  onCommentUpdate,
  postId,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const dropdownRef = useRef(null);
  const actionButtonRef = useRef(null);

  const { editComment, isEditing, editError } = useEditComment();
  const { deleteComment, isDeleting, deleteError } = useDeleteComment();
  const { handleCreateComment, isCreating } = useCreateComment();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !actionButtonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOwnComment = currentUserId === comment.member.id;

  const handleReply = (e) => {
    e.stopPropagation();
    setShowReplyForm(true);
    setShowDropdown(false);
  };

  const handleReplySubmit = async (
    postId,
    memberId,
    content,
    parentId,
    depth
  ) => {
    console.log("Received params:", {
      postId,
      memberId,
      content,
      parentId,
      depth,
    });

    if (!postId || !memberId || !content || !parentId) {
      console.error("Missing parameters:", {
        postId,
        memberId,
        content,
        parentId,
        depth,
      });
      return;
    }

    try {
      const newReply = await handleCreateComment(
        postId,
        memberId,
        content,
        parentId,
        depth + 1
      );
      if (onCommentUpdate) {
        onCommentUpdate(newReply);
      }
      setShowReplyForm(false);
    } catch (error) {
      console.error("답글 작성 실패:", error);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (isOwnComment) {
      setIsEditMode(true);
      setShowDropdown(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const updatedComment = await editComment({
        commentId: comment.id,
        memberId: currentUserId,
        content: editContent,
      });
      setIsEditMode(false);
      if (onCommentUpdate) {
        onCommentUpdate(updatedComment);
      }
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
    setEditContent(comment.content);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isOwnComment && window.confirm("댓글을 삭제하시겠습니까?")) {
      try {
        await deleteComment({
          commentId: comment.id,
          memberId: currentUserId,
        });
        if (onCommentUpdate) {
          onCommentUpdate(null, comment.id);
        }
        setShowDropdown(false);
      } catch (error) {
        console.error("댓글 삭제 실패:", error);
      }
    }
  };

  if (isEditMode) {
    return (
      <div className={`comment depth-${depth}`}>
        <div className="comment-header">
          <div className="author-line">
            <span className="comment-author">{`${comment.member.name}(${comment.member.nameEnglish})`}</span>
          </div>
        </div>
        <div className="comment-edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-textarea"
            disabled={isEditing}
          />
          {editError && <div className="error-message">{editError}</div>}
          <div className="edit-actions">
            <button
              onClick={handleEditSubmit}
              disabled={isEditing}
              className="save-button"
            >
              {isEditing ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={handleEditCancel}
              disabled={isEditing}
              className="cancel-button"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`comment depth-${depth}`}>
      <div className="comment-header">
        <div className="author-line">
          <span className="comment-author">{`${comment.member.name}(${comment.member.nameEnglish})`}</span>
          <div className="comment-actions">
            <div
              ref={actionButtonRef}
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              <MoreHorizontal size={20} />
            </div>
            {showDropdown && (
              <div className="dropdown-menu" ref={dropdownRef}>
                <div onClick={handleReply}>답글 달기</div>
                {isOwnComment && (
                  <>
                    <div onClick={handleEdit}>수정하기</div>
                    <div onClick={handleDelete}>
                      {isDeleting ? "삭제 중..." : "삭제하기"}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="comment-content">{comment.content}</div>
      <div className="comment-footer">
        <span className="comment-date">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>
      {deleteError && <div className="error-message">{deleteError}</div>}

      {showReplyForm && (
        <CommentInput
          onSubmit={handleReplySubmit}
          placeholder="답글을 입력하세요"
          isSubmitting={isCreating}
          parentId={comment.id}
          postId={postId} // 명시적으로 postId 전달
          currentUserId={currentUserId} // 명시적으로 currentUserId 전달
          depth={depth}
        />
      )}

      {comment.replies &&
        comment.replies.map((reply) => (
          <Comment
            key={`reply-${reply.id}`}
            comment={reply}
            depth={depth + 1}
            currentUserId={currentUserId}
            onCommentUpdate={onCommentUpdate}
            postId={postId}
          />
        ))}
    </div>
  );
};

Comment.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    member: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      nameEnglish: PropTypes.string.isRequired,
    }).isRequired,
    replies: PropTypes.array,
  }).isRequired,
  depth: PropTypes.number.isRequired,
  currentUserId: PropTypes.number.isRequired,
  onCommentUpdate: PropTypes.func,
  postId: PropTypes.number.isRequired,
};

export default Comment;
