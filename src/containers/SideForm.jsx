// Sidebar.jsx

import Logo from "../image/Logo.svg";
import "./styles/SideForm.scss";
import Mainicon from "../image/Mainicon.svg";
import Noticeicon from "../image/Noticeicon.svg";
import Commuicon from "../image/Commuicon.svg";
import Clubicon from "../image/Clubicon.svg";
import Mypageicon from "../image/Mypageicon.svg";
import Logouticon from "../image/Logouticon.svg";

const Sidebar = ({
  userName = "Mae.park(박세영)",
  profileImageUrl = "https://example.com/default-profile-image.jpg",
  showLogout = true, // 새로운 prop 추가
}) => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src={Logo} alt="Logo" />
      </div>
      <div className="user-info">
        <div className="user-image">
          <img src={profileImageUrl} alt="profile" />
        </div>
        <p>
          {userName}님, <br />
          환영합니다
        </p>
      </div>
      <nav>
        <ul>
          <li>
            <div className="nav-item">
              <img src={Mainicon} alt="Main" />
              메인 페이지
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Noticeicon} alt="Notice" />
              공지사항
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Commuicon} alt="Community" />
              커뮤니티
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Clubicon} alt="Club" />
              동아리
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Mypageicon} alt="My Page" />
              마이페이지
            </div>
          </li>
        </ul>
      </nav>
      {showLogout && (
        <button className="logout">
          <img src={Logouticon} alt="Logout" />
          로그아웃
        </button>
      )}
    </div>
  );
};

export default Sidebar;
