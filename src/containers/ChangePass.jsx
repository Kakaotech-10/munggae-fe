import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import Search from "../component/Search";
import "./styles/ChangePass.scss";
import Logo from "../image/logo_black.png";

const ChangePass = () => {
  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar showLogout={false} />
      </div>
      <div className="content-wrapper">
        <div className="search-area">
          <Search />
        </div>

        <div className="password-area">
          <h3>비밀번호 변경</h3>
          <img className="settinglogo" src={Logo} />
          <Input type="password" placeholder="비밀번호" />
          <Input type="password" placeholder="비밀번호 확인" />
          <Button text="비밀번호 변경하기" />
        </div>
      </div>
    </div>
  );
};

export default ChangePass;
