// LoginForm.jsx

import { useNavigate } from "react-router-dom";
import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import Logo_black from "../image/Logo_black.png";
import "./styles/LoginForm.scss";

const LoginForm = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar showLogout={false} /> {/* showLogout prop을 false로 설정 */}
      </div>
      <div className="content-wrapper">
        <div className="login-area">
          <img className="logo_black" src={Logo_black} alt="Logo_black" />

          <Input type="text" placeholder="아이디를 입력하세요" />
          <Input type="password" placeholder="비밀번호를 입력하세요" />
          <Button text="로그인" />
          <Button
            text="카카오로 로그인"
            backgroundColor="#FEE500"
            color="#3D3D3D"
          />
          <p className="no-account" onClick={handleSignup}>
            아직 계정이 없나요?
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
