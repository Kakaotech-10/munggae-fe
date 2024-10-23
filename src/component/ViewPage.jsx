//ViewPage.jsx
import PropTypes from "prop-types";
import "./styles/ViewPage.scss";
import Trashicon from "../image/Trash.svg";
import Editicon from "../image/Edit.svg";
import Hearticon from "../image/Hearticon.svg";
import Commenticon from "../image/Commenticon.svg";
import Comment from "./Comment";

const ViewPage = ({ post, comments, commentError, onClose }) => {
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

  // 댓글을 계층 구조로 정리하는 함수
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
                  style={{ cursor: "pointer" }}
                />
                <img
                  src={Editicon}
                  alt="수정하기"
                  className="edit-icon"
                  style={{ cursor: "pointer" }}
                />
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
                {commentError ? (
                  <div className="error-message">{commentError}</div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <Comment
                      key={`comment-${comment.id}`}
                      comment={comment}
                      depth={0}
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
    imageUrl: PropTypes.string.isRequired,
    likes: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    author: PropTypes.shape({
      id: PropTypes.number.isRequired,
      role: PropTypes.string.isRequired,
      course: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      nameEnglish: PropTypes.string.isRequired,
      profileImage: PropTypes.string.isRequired,
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
  onClose: PropTypes.func.isRequired,
  commentError: PropTypes.string,
};

export default ViewPage;
