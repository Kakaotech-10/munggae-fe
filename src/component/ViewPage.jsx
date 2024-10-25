import { useState } from "react";
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

const ViewPage = ({
  post,
  comments,
  commentError,
  onClose,
  onPostDelete,
  onPostEdit,
  currentUserId,
  onCommentsUpdate,
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { handleCreateComment, isCreating, createError } = useCreateComment();

  const handleCommentUpdate = (updatedComment, deletedCommentId = null) => {
    if (deletedCommentId) {
      const updatedComments = comments.filter((comment) => {
        if (comment.id === deletedCommentId) return false;
        if (comment.replies) {
          comment.replies = comment.replies.filter(
            (reply) => reply.id !== deletedCommentId
          );
        }
        return true;
      });
      onCommentsUpdate(updatedComments);
    } else if (updatedComment) {
      const isEdit = comments.some(
        (comment) => comment.id === updatedComment.id
      );

      if (isEdit) {
        const updatedComments = comments.map((comment) => {
          if (comment.id === updatedComment.id) {
            return { ...comment, ...updatedComment };
          }
          if (comment.replies) {
            comment.replies = comment.replies.map((reply) => {
              if (reply.id === updatedComment.id) {
                return { ...reply, ...updatedComment };
              }
              return reply;
            });
          }
          return comment;
        });
        onCommentsUpdate(updatedComments);
      } else {
        if (updatedComment.parentId) {
          const updatedComments = comments.map((comment) => {
            if (comment.id === updatedComment.parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), updatedComment],
              };
            }
            return comment;
          });
          onCommentsUpdate(updatedComments);
        } else {
          onCommentsUpdate([...comments, updatedComment]);
        }
      }
    }
  };

  const handleNewComment = async (postId, memberId, content) => {
    try {
      const newComment = await handleCreateComment(postId, memberId, content);
      handleCommentUpdate(newComment);
    } catch (error) {
      console.error("댓글 생성 실패:", error);
    }
  };

  const handleDeleteClick = async () => {
    try {
      if (window.confirm("게시물을 삭제하시겠습니까?")) {
        await deletePost(post.id, post.author.id);
        onPostDelete(post.id);
        onClose();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("게시물 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEditClick = () => {
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

  const organizeComments = (commentsArray) => {
    if (!Array.isArray(commentsArray) || commentsArray.length === 0) {
      return [];
    }

    const commentMap = {};
    const rootComments = [];

    commentsArray.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    commentsArray.forEach((comment) => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
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
            </div>
            <div className="form-group">
              <div className="title">제목: {post.title}</div>
              <div className="content">{post.content}</div>
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
                  postId={post.id}
                  currentUserId={currentUserId}
                  depth={0}
                  isSubmitting={isCreating}
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
  currentUserId: PropTypes.number.isRequired,
  onCommentsUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onPostDelete: PropTypes.func.isRequired,
  onPostEdit: PropTypes.func.isRequired,
  commentError: PropTypes.string,
};

export default ViewPage;
