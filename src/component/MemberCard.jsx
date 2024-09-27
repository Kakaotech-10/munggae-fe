import "./styles/MemberCard.scss";
import CardIconSrc from "../image/CardUploadicon.svg";

const MemberCardUpload = () => {
  return (
    <div className="member-card-upload">
      <label className="upload-label">
        <img src={CardIconSrc} alt="Card Icon" className="card-icon" />
        <input type="file" accept="image/*" />
        <span>회원 카드 업로드</span>
      </label>
    </div>
  );
};

export default MemberCardUpload;
