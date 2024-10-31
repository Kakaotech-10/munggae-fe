import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../image/logo.png";
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

const Sidebar = ({ showLogout }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userName: "",
    profileImageUrl: "",
    isLoggedIn: false,
  });

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const memberName = localStorage.getItem("memberName");
    const memberNameEnglish = localStorage.getItem("memberNameEnglish");
    const profileImage = localStorage.getItem("profileImage");

    if (memberName && memberNameEnglish) {
      setUserInfo({
        userName: `${memberNameEnglish}(${memberName})`,
        profileImageUrl: profileImage || "",
        isLoggedIn: true,
      });
    }
  }, []);

  const handleLogoClick = () => {
    navigate("/mainpage");
  };

  const handleLogoKeyPress = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLogoClick();
    }
  };

  const getWelcomeMessage = () => {
    if (userInfo.isLoggedIn) {
      return (
        <p>
          <span className="user-name">{userInfo.userName}</span>님, <br />
          환영합니다
        </p>
      );
    }
    return (
      <p>
        안녕하세요 <br />
        뭉게뭉게에 오신 것을 환영합니다.
      </p>
    );
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
          {userInfo.profileImageUrl && (
            <img src={userInfo.profileImageUrl} alt="profile" />
          )}
        </div>
        {getWelcomeMessage()}
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
          {showLogout && userInfo.isLoggedIn && (
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
  showLogout: PropTypes.bool,
};

Sidebar.defaultProps = {
  showLogout: true,
};

export default Sidebar;
