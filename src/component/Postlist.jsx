import PropTypes from "prop-types";
import "./styles/Postlist.scss";
import Hearticon from "../image/Hearticon.svg";

const Postlist = ({ id, title, imageUrl, likes }) => {
  return (
    <div className="postlist-container" data-post-id={id}>
      <div className="postlist-img">
        <img src={imageUrl} alt="게시물 이미지" />
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
  imageUrl: PropTypes.string.isRequired,
  likes: PropTypes.string.isRequired,
};

export default Postlist;
