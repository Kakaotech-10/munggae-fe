import PropTypes from "prop-types";
import "./styles/ViewPage.scss";
import Trashicon from "../image/Trash.svg";
import Editicon from "../image/Edit.svg";
import Hearticon from "../image/Hearticon.svg";
import Commenticon from "../image/Commenticon.svg";

const ViewPage = ({ post, onClose }) => {
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
                <span>{post.comments ? post.comments.length : 0}</span>
              </div>
              <hr className="comment-divider" />
              <div className="comment-area">
                {post.comments &&
                  post.comments.map((comment, index) => (
                    <div key={index} className="comment">
                      <div className="comment-header">
                        <span className="comment-author">{`${comment.author.name}(${comment.author.nameEnglish})`}</span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                      <div className="comment-footer">
                        <img
                          src={Hearticon}
                          alt="좋아요"
                          className="comment-like-icon"
                        />
                        <span>{comment.likes}</span>
                      </div>
                    </div>
                  ))}
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
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        author: PropTypes.shape({
          name: PropTypes.string.isRequired,
          nameEnglish: PropTypes.string.isRequired,
        }).isRequired,
        content: PropTypes.string.isRequired,
        likes: PropTypes.number.isRequired,
      })
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ViewPage;
