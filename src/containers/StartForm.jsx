import { useNavigate } from "react-router-dom";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import Button from "../component/Button";
import Logo_black from "../image/logo_black.png";
import "./styles/StartForm.scss";
import { KAKAO_AUTH_URL } from "../api/auth"; // 경로 수정

const StartForm = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
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
        <div className="start-area">
          <img className="logo_black" src={Logo_black} alt="Logo_black" />
          <Button text="로그인" onClick={handleLogin} />
          <Button
            text="회원가입"
            className="signup-button"
            onClick={handleSignup}
          />
          <Button
            text="카카오로 회원가입"
            backgroundColor="#FEE500"
            color="#3D3D3D"
            onClick={handleKakaoLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default StartForm;
