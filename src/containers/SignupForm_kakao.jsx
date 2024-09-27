import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import MemberCard from "../component/MemberCard";
import ProfileUpload from "../component/ProfileUpload";
import "./styles/SignupForm.scss";

const SignupForm_kakao = () => {
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
          <Input type="text" placeholder="이름" />

          <Button text="회원가입" />
        </div>
      </div>
    </div>
  );
};

export default SignupForm_kakao;
