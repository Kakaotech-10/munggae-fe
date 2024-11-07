import PropTypes from "prop-types";
import "./styles/Postlist.scss";
import Hearticon from "../image/Hearticon.svg";
import SimpleFilteredContent from "./SimpleFilteredContent";

const Postlist = ({ id, title, imageUrl = "", likes, clean = true }) => {
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
              e.target.src = "/default-image.png";
            }}
          />
        ) : (
          <div className="no-image"></div>
        )}
      </div>
      <div className="postlist-title">
        <SimpleFilteredContent content={title} clean={clean} />
      </div>

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
  clean: PropTypes.bool,
};

export default Postlist;
