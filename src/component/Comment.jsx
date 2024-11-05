import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { MoreHorizontal } from "lucide-react";
import CommentInput from "./CommentInput";
import {
  useCreateComment,
  useEditComment,
  useDeleteComment,
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

  const { handleEditComment, isEditing, editError } = useEditComment();
  const { handleDeleteComment, isDeleting } = useDeleteComment();
  const { handleCreateComment, isCreating, createError } = useCreateComment();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !actionButtonRef.current?.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOwnComment = currentUserId === comment.member.id;

  const handleEdit = async () => {
    if (!editContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const updatedComment = await handleEditComment(
        comment.id,
        editContent.trim()
      );
      const formattedComment = {
        ...comment,
        content: updatedComment.content,
        updatedAt: updatedComment.updatedAt,
      };

      onCommentUpdate(formattedComment);
      setIsEditMode(false);
      setShowDropdown(false);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert(error.message || "댓글 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!isOwnComment || !window.confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await handleDeleteComment(comment.id);
      onCommentUpdate(null, comment.id);
      setShowDropdown(false);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert(error.message || "댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleReply = async (content) => {
    if (!content || typeof content !== "string") {
      console.error("Invalid content:", content);
      return;
    }

    try {
      const validContent = String(content).trim();
      if (!validContent) {
        alert("댓글 내용을 입력해주세요.");
        return;
      }

      const newReply = await handleCreateComment(
        postId,
        currentUserId,
        validContent,
        comment.id
      );

      if (newReply) {
        const replyWithParentInfo = {
          ...newReply,
          parentAuthor: {
            name: comment.member.name,
            nameEnglish: comment.member.nameEnglish,
          },
        };
        onCommentUpdate(replyWithParentInfo);
        setShowReplyForm(false);
      }
    } catch (error) {
      console.error("답글 작성 실패:", error);
      alert(error.message || "답글 작성 중 오류가 발생했습니다.");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Date(dateString).toLocaleDateString("ko-KR", options);
  };

  return (
    <div className={`comment ${depth > 0 ? "reply" : ""}`}>
      {depth > 0 && (
        <div className="reply-indicator">
          <span className="reply-arrow">↳</span>
          <span>{`${comment.parentAuthor?.nameEnglish}(${comment.parentAuthor?.name})님에 대한 답글`}</span>
        </div>
      )}

      <div className="comment-header">
        <div className="author-line">
          <span className="comment-author">
            {`${comment.member.nameEnglish}(${comment.member.name})`}
          </span>
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
                {depth < 1 && (
                  <div
                    onClick={() => {
                      setShowReplyForm(true);
                      setShowDropdown(false);
                    }}
                  >
                    답글 달기
                  </div>
                )}
                {isOwnComment && (
                  <>
                    <div
                      onClick={() => {
                        setIsEditMode(true);
                        setShowDropdown(false);
                      }}
                    >
                      수정하기
                    </div>
                    <div
                      onClick={handleDelete}
                      className={isDeleting ? "disabled" : ""}
                    >
                      {isDeleting ? "삭제 중..." : "삭제하기"}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="comment-content">
        {isEditMode ? (
          <div className="comment-edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={isEditing}
              placeholder="댓글을 입력하세요"
            />
            {editError && <div className="error-message">{editError}</div>}
            <div className="edit-actions">
              <button
                onClick={handleEdit}
                disabled={isEditing || !editContent.trim()}
                className="save-button"
              >
                {isEditing ? "저장 중..." : "저장"}
              </button>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setEditContent(comment.content);
                }}
                disabled={isEditing}
                className="cancel-button"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="content-text">{comment.content}</div>
            <div className="comment-footer">
              <span className="comment-date">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </>
        )}
      </div>

      {showReplyForm && (
        <div className="reply-form">
          <div className="reply-to-text">
            {`${comment.member.nameEnglish}(${comment.member.name})님에게 답글 작성 중`}
          </div>
          <CommentInput
            onSubmit={handleReply}
            placeholder="답글을 입력하세요"
            isSubmitting={isCreating}
          />
          {createError && <div className="error-message">{createError}</div>}
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="replies">
          {comment.replies.map((reply) => (
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
      )}
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
    parentAuthor: PropTypes.shape({
      // parentAuthor 추가
      name: PropTypes.string.isRequired,
      nameEnglish: PropTypes.string.isRequired,
    }),
    replies: PropTypes.array,
  }).isRequired,
  depth: PropTypes.number.isRequired,
  currentUserId: PropTypes.number.isRequired,
  onCommentUpdate: PropTypes.func.isRequired,
  postId: PropTypes.number.isRequired,
};

export default Comment;
