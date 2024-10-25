import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./styles/PostForm.scss";
import Hearticon from "../image/Hearticon.svg";
import Commenticon from "../image/Commenticon.svg";
import FullHearticon from "../image/FullHearticon.svg";
import Comment from "../component/Comment";
import CommentInput from "../component/CommentInput";
import { useCreateComment } from "../hooks/useComment";

const Post = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleCreateComment, isCreating, createError } = useCreateComment();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/comments`);
        const data = await response.json();
        setComments(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [post.post_id]);

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
      setComments(updatedComments);
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
        setComments(updatedComments);
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
          setComments(updatedComments);
        } else {
          setComments([...comments, updatedComment]);
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

  const handlePostLikeClick = () => {
    if (isLiked) {
      setLikeCount((prevCount) => prevCount - 1);
    } else {
      setLikeCount((prevCount) => prevCount + 1);
    }
    setIsLiked((prevIsLiked) => !prevIsLiked);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    const ampm = hour >= 12 ? "오후" : "오전";
    const hour12 = hour % 12 || 12;

    return `${year}.${month}.${day} ${ampm}${hour12}:${minute}`;
  };

  if (!post || !post.member) {
    return <div>Loading...</div>;
  }

  return (
    <div className="post">
      <div className="post-header">
        <div className="user-info">
          <div className="user-image">
            <img
              src="https://example.com/default-profile-image.jpg"
              alt="profile"
            />
          </div>
          <div className="user-details">
            <h3>{`${post.member.member_name}(${post.member.member_name_english})`}</h3>
            <p>{formatDate(post.created_at)}</p>
          </div>
        </div>
        <div className="post-category">[{post.member.course}]</div>
      </div>
      <div className="post-content">
        <div className="post-text">{post.post_content}</div>
      </div>
      <div className="post-footer">
        <div className="reactions">
          <div className="reaction-item" onClick={handlePostLikeClick}>
            <img src={isLiked ? FullHearticon : Hearticon} alt="Like" />
            <span>{likeCount}</span>
          </div>
          <div className="reaction-item">
            <img src={Commenticon} alt="Comment" />
            <span>{comments.length}</span>
          </div>
        </div>
        <hr className="comment-divider" />
        <div className="comment-area">
          <CommentInput
            onSubmit={handleNewComment}
            postId={post.post_id}
            currentUserId={post.member.member_id}
            depth={0}
            isSubmitting={isCreating}
          />
          {createError && <div className="error-message">{createError}</div>}
          {isLoading ? (
            <div>Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <Comment
                key={`comment-${comment.id}`}
                comment={{
                  ...comment,
                  member: {
                    id: comment.member.member_id,
                    name: comment.member.member_name,
                    nameEnglish: comment.member.member_name_english,
                  },
                }}
                depth={0}
                currentUserId={post.member.member_id}
                postId={post.post_id}
                onCommentUpdate={handleCommentUpdate}
              />
            ))
          ) : (
            <div className="no-comments">댓글이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

Post.propTypes = {
  post: PropTypes.shape({
    post_id: PropTypes.number.isRequired,
    post_title: PropTypes.string.isRequired,
    post_content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    updated_at: PropTypes.string.isRequired,
    member: PropTypes.shape({
      member_id: PropTypes.number.isRequired,
      member_name: PropTypes.string.isRequired,
      member_name_english: PropTypes.string.isRequired,
      course: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Post;
