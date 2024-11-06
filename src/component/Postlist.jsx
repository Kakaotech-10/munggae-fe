import PropTypes from "prop-types";
import "./styles/Postlist.scss";
import Hearticon from "../image/Hearticon.svg";

const Postlist = ({ id, title, imageUrl, likes }) => {
  return (
    <div className="postlist-container" data-post-id={id}>
      <div className="postlist-img">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="게시물 이미지"
            onError={(e) => {
              console.error("Image load error:", imageUrl);
              e.target.onerror = null;
              e.target.src = "/default-image.png"; // 기본 이미지 경로
            }}
          />
        ) : (
          <div className="no-image"></div>
        )}
      </div>
      <div className="postlist-title">{title}</div>

      <div className="postlist-heart">
        <img src={Hearticon} alt="하트 아이콘" />
        <span>{likes}</span>
      </div>
    </div>
  );
};

Postlist.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  likes: PropTypes.string.isRequired,
};

Postlist.defaultProps = {
  imageUrl: "",
};

export default Postlist;
