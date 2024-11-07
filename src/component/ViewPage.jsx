import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./styles/ViewPage.scss";
import Trashicon from "../image/Trash.svg";
import Editicon from "../image/Edit.svg";
import Hearticon from "../image/Hearticon.svg";
import Commenticon from "../image/Commenticon.svg";
import Comment from "./Comment";
import { deletePost } from "../api/useDeletePost";
import WriteForm from "../containers/WriteForm";
import CommentInput from "./CommentInput";
import { useCreateComment } from "../hooks/useComment";
import FilteredContent from "./FilteredContent";

const ViewPage = ({
  post,
  comments,
  commentError,
  onClose,
  onPostDelete,
  onPostEdit,
  onCommentsUpdate,
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { handleCreateComment, isCreating, createError } = useCreateComment();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId ? parseInt(userId) : null);
  }, []);

  const isAuthor = currentUserId === post.author.id;

  // ViewPage.jsx
  const handleCommentUpdate = (updatedComment, deletedCommentId = null) => {
    if (!onCommentsUpdate) {
      console.error("onCommentsUpdate function is not provided");
      return;
    }

    let updatedComments = [...comments];

    if (deletedCommentId) {
      // 삭제된 댓글과 그 대댓글들을 제거
      updatedComments = updatedComments.filter((comment) => {
        if (comment.id === deletedCommentId) return false;
        if (comment.replies) {
          comment.replies = comment.replies.filter(
            (reply) => reply.id !== deletedCommentId
          );
        }
        return true;
      });
    } else if (updatedComment) {
      const parentId = updatedComment.parentId;

      if (parentId) {
        // 대댓글인 경우
        updatedComments = updatedComments.map((comment) => {
          if (comment.id === parentId) {
            // 부모 댓글을 찾아서 replies에 추가
            return {
              ...comment,
              replies: [...(comment.replies || []), updatedComment].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              ),
            };
          }
          return comment;
        });
      } else {
        // 일반 댓글인 경우
        const existingCommentIndex = updatedComments.findIndex(
          (comment) => comment.id === updatedComment.id
        );

        if (existingCommentIndex !== -1) {
          // 기존 댓글 수정
          updatedComments[existingCommentIndex] = {
            ...updatedComments[existingCommentIndex],
            ...updatedComment,
          };
        } else {
          // 새 댓글 추가
          updatedComments = [
            {
              ...updatedComment,
              replies: [],
            },
            ...updatedComments,
          ];
        }
      }
    }

    console.log("Sending updated comments:", updatedComments);
    onCommentsUpdate(updatedComments);
  };

  const handleNewComment = async (content, parentId = null, depth = 0) => {
    try {
      if (!content?.trim()) {
        throw new Error("댓글 내용을 입력해주세요.");
      }

      if (!currentUserId) {
        throw new Error("로그인이 필요합니다.");
      }

      if (!post.id) {
        throw new Error("게시글 정보가 없습니다.");
      }

      const newComment = await handleCreateComment(
        post.id, // postId
        currentUserId, // memberId
        content.trim(),
        parentId, // parentId (답글인 경우에만 값이 있음)
        depth // depth
      );

      if (newComment) {
        handleCommentUpdate(newComment);
      }
    } catch (error) {
      console.error("댓글 생성 실패:", error);
      alert(error.message || "댓글 작성 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteClick = async () => {
    try {
      if (!isAuthor) {
        alert("게시물 작성자만 삭제할 수 있습니다.");
        return;
      }

      if (window.confirm("게시물을 삭제하시겠습니까?")) {
        await deletePost(post.id, currentUserId);
        onPostDelete(post.id);
        onClose();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("게시물 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEditClick = () => {
    if (!isAuthor) {
      alert("게시물 작성자만 수정할 수 있습니다.");
      return;
    }
    setShowEditForm(true);
  };

  const handleEditComplete = async (updatedPost) => {
    await onPostEdit(updatedPost);
    setShowEditForm(false);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "view-form-overlay") {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
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
    <div
      className="view-form-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex="-1"
    >
      <div className="view-form-container">
        <div className="form-layout">
          <div className="left-section">
            <div className="image-area">
              <img src={post.imageUrl} alt="게시물 이미지" />
            </div>
          </div>
          <div className="right-section">
            <div className="profile-section">
              <img
                src={post.author.profileImage}
                alt="프로필"
                className="profile-image"
              />
              <div className="profile-info">
                <span className="profile-name">{`${post.author.name}(${post.author.nameEnglish})`}</span>
                <span className="upload-time">
                  {formatDate(post.updatedAt)}
                </span>
              </div>
              {isAuthor && (
                <div className="icons">
                  <img
                    src={Trashicon}
                    alt="삭제하기"
                    className="trash-icon"
                    onClick={handleDeleteClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleDeleteClick();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src={Editicon}
                    alt="수정하기"
                    className="edit-icon"
                    onClick={handleEditClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleEditClick();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                  />
                  {showEditForm && (
                    <WriteForm
                      editMode={true}
                      initialPost={post}
                      onClose={() => setShowEditForm(false)}
                      onPostCreated={handleEditComplete}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="form-group">
              <FilteredContent
                title={post.title}
                content={post.content}
                clean={post.clean}
              />
              <div className="reaction">
                <img className="hearts" src={Hearticon} alt="하트 아이콘" />
                <span>{post.likes}</span>
                <div className="divider"></div>
                <img className="comments" src={Commenticon} alt="댓글 아이콘" />
                <span>{comments.length}</span>
              </div>
              <hr className="comment-divider" />
              <div className="comment-area">
                <CommentInput
                  onSubmit={handleNewComment}
                  placeholder="댓글을 입력하세요"
                  isSubmitting={isCreating}
                  depth={0}
                />
                {createError && (
                  <div className="error-message">{createError}</div>
                )}
                {commentError ? (
                  <div className="error-message">{commentError}</div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <Comment
                      key={`comment-${comment.id}`}
                      comment={comment}
                      depth={0}
                      currentUserId={currentUserId}
                      postId={post.id}
                      onCommentUpdate={handleCommentUpdate}
                    />
                  ))
                ) : (
                  <div className="no-comments">댓글이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ViewPage.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    likes: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    clean: PropTypes.bool.isRequired, // isClean에서 clean으로 변경
    author: PropTypes.shape({
      id: PropTypes.number.isRequired,
      role: PropTypes.string.isRequired,
      course: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      nameEnglish: PropTypes.string.isRequired,
      profileImage: PropTypes.string,
    }).isRequired,
  }).isRequired,
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      content: PropTypes.string.isRequired,
      parentId: PropTypes.number,
      depth: PropTypes.number,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
      member: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        nameEnglish: PropTypes.string.isRequired,
      }).isRequired,
    })
  ).isRequired,
  onCommentsUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onPostDelete: PropTypes.func.isRequired,
  onPostEdit: PropTypes.func.isRequired,
  commentError: PropTypes.string,
};

export default ViewPage;
