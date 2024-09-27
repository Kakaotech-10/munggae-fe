import { useNavigate } from "react-router-dom";
import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import MemberCard from "../component/MemberCard";
import ProfileUpload from "../component/ProfileUpload";
import "./styles/SignupForm.scss";

const SignupForm = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleKakaoSignup = () => {
    navigate("/kakaosignup");
  };

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar showLogout={false} />
      </div>
      <div className="content-wrapper">
        <div className="signup-area">
          <ProfileUpload />
          <MemberCard />
          <Input type="text" placeholder="회원번호" />
          <Input type="text" placeholder="아이디" />
          <Input type="text" placeholder="이름" />
          <Input type="password" placeholder="비밀번호" />
          <Input type="password" placeholder="비밀번호 확인" />
          <Button text="회원가입" />
          <Button
            text="카카오로 회원가입"
            backgroundColor="#FEE500"
            color="#3D3D3D"
            onClick={handleKakaoSignup}
          />
          <p className="re-login" onClick={handleLogin}>
            로그인
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
