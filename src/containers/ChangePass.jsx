import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import "./styles/ChangePass.scss";

const ChangePass = () => {
  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar showLogout={false} />
      </div>
      <div className="content-wrapper">
        <div className="password-area">
          <Input type="password" placeholder="비밀번호" />
          <Input type="password" placeholder="비밀번호 확인" />
          <Button text="비밀번호 변경하기" />
        </div>
      </div>
    </div>
  );
};

export default ChangePass;
