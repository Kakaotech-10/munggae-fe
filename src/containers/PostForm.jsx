//PostForm.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./styles/PostForm.scss";
import Hearticon from "../image/Hearticon.svg";
import Commenticon from "../image/Commenticon.svg";
import FullHearticon from "../image/FullHearticon.svg";
import { getPosts } from "../api/useGetPosts";
import Comment from "../component/Comment"; // 기존 Comment 컴포넌트 import

const Post = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // API 호출 예시 (실제 API 엔드포인트에 맞게 수정 필요)
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
        <div className="comment-box">
          {isLoading ? (
            <div>Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={{
                  ...comment,
                  member: {
                    name: comment.member.member_name,
                    nameEnglish: comment.member.member_name_english,
                  },
                }}
                depth={0}
              />
            ))
          ) : (
            <div>댓글이 없습니다.</div>
          )}
        </div>
        <div className="comment-input">
          <input type="text" placeholder="댓글을 입력해주세요" />
          <button>SEND</button>
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
