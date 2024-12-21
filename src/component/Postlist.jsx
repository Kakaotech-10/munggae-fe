import PropTypes from "prop-types";
import "./styles/Postlist.scss";
import Hearticon from "../image/Hearticon.svg";
import SimpleFilteredContent from "./SimpleFilteredContent";

const Postlist = ({ id, title, imageUrls = [], likes, clean = true }) => {
  // 이미지 URL 객체에서 path 추출
  const getImagePath = (imageUrl) => {
    if (typeof imageUrl === "string") return imageUrl;
    return imageUrl?.path || "";
  };

  const firstImage =
    imageUrls && imageUrls.length > 0 ? getImagePath(imageUrls[0]) : "";

  return (
    <div className="postlist-container" data-post-id={id}>
      <div className="postlist-img">
        {firstImage ? (
          <img
            src={firstImage}
            alt="게시물 썸네일"
            onError={(e) => {
              console.error("Image load error:", firstImage);
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
  imageUrls: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        imageId: PropTypes.number,
        fileName: PropTypes.string,
        path: PropTypes.string,
      }),
    ])
  ),
  likes: PropTypes.string.isRequired,
  clean: PropTypes.bool,
};

export default Postlist;
