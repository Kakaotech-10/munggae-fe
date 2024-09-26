// Post.jsx
import { useState } from "react";
import "./styles/PostForm.scss";
import Hearticon from "../image/Hearticon.svg";
import Commenticon from "../image/Commenticon.svg";
import FullHearticon from "../image/FullHearticon.svg";

const Post = ({
  userName = "Mae.park(박세영)",
  uploadDate = "2024.09.25 오후12:00",
  postContent = "어떤 것이든 입력해주세요",
  imageUrl = "",
  profileImageUrl = "https://example.com/default-profile-image.jpg",
  category = "커뮤니티", // 새로 추가된 prop
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "John Doe",
      content: "Great post!",
      likes: 5,
      isLiked: false,
    },
    {
      id: 2,
      name: "Jane Smith",
      content: "Thanks for sharing!",
      likes: 3,
      isLiked: false,
    },
  ]);

  const handlePostLikeClick = () => {
    if (isLiked) {
      setLikeCount((prevCount) => prevCount - 1);
    } else {
      setLikeCount((prevCount) => prevCount + 1);
    }
    setIsLiked((prevIsLiked) => !prevIsLiked);
  };

  const handleCommentLikeClick = (commentId) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked,
            }
          : comment
      )
    );
  };

  return (
    <div className="post">
      <div className="post-header">
        <div className="user-info">
          <div className="user-image">
            <img src={profileImageUrl} alt="profile" />
          </div>
          <div className="user-details">
            <h3>{userName}</h3>
            <p>{uploadDate}</p>
          </div>
        </div>
        <div className="post-category">[{category}]</div>
      </div>
      <div className="post-content">
        {imageUrl && (
          <div className="post-image-container">
            <img src={imageUrl} alt="Post" className="post-image" />
          </div>
        )}
        <div className="post-text">{postContent}</div>
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
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-content">
                <strong>{comment.name}</strong>
                <p>{comment.content}</p>
              </div>
              <div
                className="comment-like"
                onClick={() => handleCommentLikeClick(comment.id)}
              >
                <img
                  src={comment.isLiked ? FullHearticon : Hearticon}
                  alt="Like"
                />
                <span>{comment.likes}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="comment-input">
          <input type="text" placeholder="댓글을 입력해주세요" />
          <button>SEND</button>
        </div>
      </div>
    </div>
  );
};

export default Post;
