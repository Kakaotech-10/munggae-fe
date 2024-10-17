//SideForm.jsx
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Logo from "../image/Logo.png";
import "./styles/SideForm.scss";
import Mainicon from "../image/Mainicon.svg";
import Noticeicon from "../image/Noticeicon.svg";
import Commuicon from "../image/Commuicon.svg";
import Clubicon from "../image/Clubicon.svg";
import Mypageicon from "../image/Mypageicon.svg";
import Logouticon from "../image/Logouticon.svg";

const NavItem = ({ icon, alt, text, path }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(path);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigation();
    }
  };

  return (
    <li>
      <div
        className="nav-item"
        onClick={handleNavigation}
        onKeyPress={handleKeyPress}
        role="button"
        tabIndex={0}
      >
        <img src={icon} alt={alt} />
        <span className="nav-text">{text}</span>
      </div>
    </li>
  );
};

NavItem.propTypes = {
  icon: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
};

const Sidebar = ({ userName, profileImageUrl, showLogout }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/mainpage");
  };

  const handleLogoKeyPress = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLogoClick();
    }
  };

  return (
    <div className="sidebar">
      <div
        className="logo"
        onClick={handleLogoClick}
        onKeyPress={handleLogoKeyPress}
        role="button"
        tabIndex={0}
      >
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
          <NavItem
            icon={Mainicon}
            alt="Main"
            text="메인 페이지"
            path="/mainpage"
          />
          <NavItem
            icon={Noticeicon}
            alt="Notice"
            text="공지사항"
            path="/noticepage"
          />
          <NavItem
            icon={Commuicon}
            alt="Community"
            text="커뮤니티"
            path="/communitypage"
          />
          <NavItem icon={Clubicon} alt="Club" text="동아리" path="/clubpage" />
          <NavItem
            icon={Mypageicon}
            alt="My Page"
            text="마이페이지"
            path="/setting"
          />
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

Sidebar.propTypes = {
  userName: PropTypes.string,
  profileImageUrl: PropTypes.string,
  showLogout: PropTypes.bool,
};

Sidebar.defaultProps = {
  userName: "Mae.park(박세영)",
  profileImageUrl: "https://example.com/default-profile-image.jpg",
  showLogout: true,
};

export default Sidebar;
