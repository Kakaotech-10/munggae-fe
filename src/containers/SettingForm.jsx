import { useNavigate } from "react-router-dom";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import Button from "../component/Button";
import Input from "../component/Input";
import ProfileUpload from "../component/ProfileUpload";
import "./styles/SettingForm.scss";

const SettingForm = () => {
  const navigate = useNavigate();

  const handleChangePassword = () => {
    navigate("/setting/changepassword");
  };

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="content-wrapper">
        <div className="search-area">
          <Search />
        </div>
        <div className="setting-area">
          <div className="signup-area">
            <h3>마이페이지</h3>
            <ProfileUpload />
            <Input
              type="text"
              placeholder="아이디"
              disabled={true}
              value="아이디: user123" // 실제 사용자 아이디로 대체
            />
            <Input type="text" placeholder="이름(한글)" />
            <Input type="text" placeholder="이름(영문)" />

            <div className="button-group">
              <button className="action-button" onClick={handleChangePassword}>
                비밀번호 변경
              </button>
              <button className="action-button">내 게시물</button>
            </div>

            <Button text="정보수정하기" />
            <span className="Withdrawal">회원탈퇴하기</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingForm;
