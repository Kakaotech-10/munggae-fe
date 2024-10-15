//SideForm.jsx
import { useNavigate } from "react-router-dom";
import Logo from "../image/Logo.png";
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
  const navigate = useNavigate();
  const handleMainpage = () => {
    navigate("/mainpage");
  };
  const handleNoticepage = () => {
    navigate("/noticepage");
  };
  const handleCommunitypage = () => {
    navigate("/communitypage");
  };
  const handleSettingpage = () => {
    navigate("/setting");
  };
  const handleClubpage = () => {
    navigate("/clubpage");
  };
  return (
    <div className="sidebar">
      <div className="logo">
        <img src={Logo} alt="Logo" onClick={handleMainpage} />
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
              <span className="nav-text" onClick={handleMainpage}>
                메인 페이지
              </span>
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Noticeicon} alt="Notice" />
              <span className="nav-text" onClick={handleNoticepage}>
                공지사항
              </span>
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Commuicon} alt="Community" />
              <span className="nav-text" onClick={handleCommunitypage}>
                커뮤니티
              </span>
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Clubicon} alt="Club" />
              <span className="nav-text" onClick={handleClubpage}>
                동아리
              </span>
            </div>
          </li>
          <li>
            <div className="nav-item">
              <img src={Mypageicon} alt="My Page" />
              <span className="nav-text" onClick={handleSettingpage}>
                마이페이지
              </span>
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
