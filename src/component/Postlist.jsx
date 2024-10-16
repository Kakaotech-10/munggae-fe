import "./styles/Postlist.scss";
import Hearticon from "../image/Hearticon.svg";

const Postlist = ({ imageUrl, title, likes }) => {
  return (
    <div className="postlist-container">
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

export default Postlist;
