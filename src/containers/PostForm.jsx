import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./styles/PostForm.scss";
import Hearticon from "../image/Hearticon.svg";
import Commenticon from "../image/Commenticon.svg";
import FullHearticon from "../image/FullHearticon.svg";
import Comment from "../component/Comment";
import CommentInput from "../component/CommentInput";
import { useCreateComment } from "../hooks/useComment";
import { getPostComments } from "../api/useGetComment";

const Post = ({ post, currentUserId }) => {
  // currentUserId prop 추가
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentError, setCommentError] = useState(null);
  const { handleCreateComment, isCreating, createError } = useCreateComment();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const { error, comments: commentsData } = await getPostComments(
          post.post_id
        );

        if (error) {
          setCommentError(error);
          return;
        }

        setComments(commentsData.content); // content에 이미 계층구조가 포함되어 있음
        setCommentError(null);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setCommentError("댓글을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (post.post_id) {
      fetchComments();
    }
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
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="post-images">
            {post.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`게시물 이미지 ${index + 1}`}
                className="post-image"
              />
            ))}
          </div>
        )}
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
            currentUserId={currentUserId}
            depth={0}
            isSubmitting={isCreating}
          />
          {createError && <div className="error-message">{createError}</div>}
          {commentError ? (
            <div className="error-message">{commentError}</div>
          ) : isLoading ? (
            <div>Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <Comment
                key={`comment-${comment.id}`}
                comment={comment}
                depth={0}
                currentUserId={currentUserId}
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
    imageUrls: PropTypes.arrayOf(PropTypes.string), // 이미지 URL 배열 추가
    s3ImageUrls: PropTypes.arrayOf(PropTypes.string), // S3 URL 배열 추가
    member: PropTypes.shape({
      member_id: PropTypes.number.isRequired,
      member_name: PropTypes.string.isRequired,
      member_name_english: PropTypes.string.isRequired,
      course: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  currentUserId: PropTypes.number.isRequired,
};

Post.defaultProps = {
  post: {
    imageUrls: [], // 기본값 설정
    s3ImageUrls: [], // 기본값 설정
  },
};
export default Post;
