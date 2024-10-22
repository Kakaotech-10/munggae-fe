import { useNavigate } from "react-router-dom";
import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import Select from "../component/Select";
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

  const handleFieldChange = (e) => {
    console.log("Selected field:", e.target.value);
    // 여기에 선택된 필드를 처리하는 로직을 추가할 수 있습니다.
  };

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar showLogout={false} />
      </div>
      <div className="content-wrapper">
        <div className="signup-area">
          <ProfileUpload />
          <Input type="text" placeholder="아이디" />
          <Input type="text" placeholder="이름(한글)" />
          <Input type="text" placeholder="이름(영문)" />
          <Select
            options={["풀스택", "클라우드", "인공지능"]}
            onChange={handleFieldChange}
            placeholder="분야 선택"
          />
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
