import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import Button from "../component/Button";
import Logo_black from "../image/logo_black.png";
import "./styles/StartForm.scss";
import { KAKAO_AUTH_URL } from "../api/auth";

// 인증 상태를 확인하는 함수
const checkAuthStatus = () => {
  const accessToken = localStorage.getItem("accessToken");
  const memberInfo = localStorage.getItem("memberInfo");

  try {
    // memberInfo가 유효한 JSON인지 확인
    if (accessToken && memberInfo) {
      const parsedMemberInfo = JSON.parse(memberInfo);
      return parsedMemberInfo && parsedMemberInfo.id ? true : false;
    }
  } catch (e) {
    console.error("Failed to parse memberInfo:", e);
    // 유효하지 않은 memberInfo는 로컬스토리지에서 제거
    localStorage.removeItem("memberInfo");
    localStorage.removeItem("accessToken");
  }

  return false;
};

const StartForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 컴포넌트 마운트 시 인증 상태 확인
    if (checkAuthStatus()) {
      navigate("/mainpage", { replace: true });
    }
  }, [navigate]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  // 이미 인증된 상태라면 렌더링하지 않음
  if (checkAuthStatus()) {
    return null;
  }

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
