import React from "react";
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
  showLogout = true,
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
          <span className="user-name">{userName}</span>님, <br />
          환영합니다
        </p>
      </div>
      <nav>
        <ul>
          <li>
            <div className="nav-item">
              <img src={Mainicon} alt="Main" />
              <span className="nav-text">메인 페이지</span>
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Noticeicon} alt="Notice" />
              <span className="nav-text">공지사항</span>
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Commuicon} alt="Community" />
              <span className="nav-text">커뮤니티</span>
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Clubicon} alt="Club" />
              <span className="nav-text">동아리</span>
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Mypageicon} alt="My Page" />
              <span className="nav-text">마이페이지</span>
            </div>
          </li>
          {showLogout && (
            <li>
              <button className="nav-item logout">
                <img src={Logouticon} alt="Logout" />
                <span className="nav-text">로그아웃</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
