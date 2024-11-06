import PropTypes from "prop-types";
import "./styles/Postlist.scss";
import Hearticon from "../image/Hearticon.svg";

const Postlist = ({ id, title, imageUrl, likes }) => {
  return (
    <div className="postlist-container" data-post-id={id}>
      <div className="postlist-img">
        {imageUrl && imageUrl.trim() !== "" ? (
          <img
            src={imageUrl}
            alt="게시물 이미지"
            onError={(e) => {
              console.error(`이미지 로드 오류: ${imageUrl}`);
              e.target.onerror = null; // 무한 루프 방지
              e.target.src = "/default-image.png"; // 기본 이미지 경로 설정
            }}
          />
        ) : (
          <div className="no-image">이미지가 없습니다.</div>
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
  id: PropTypes.number.isRequired, // 게시물 고유 ID
  title: PropTypes.string.isRequired, // 게시물 제목
  imageUrl: PropTypes.string, // 게시물 이미지 URL (선택 사항)
  likes: PropTypes.string.isRequired, // 좋아요 수
};

Postlist.defaultProps = {
  imageUrl: "", // 이미지 URL 기본값 설정
};

export default Postlist;
