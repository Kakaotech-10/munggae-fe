import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/config"; // api import 추가
import Logo from "../image/logo.png";
import "./styles/SideForm.scss";
import Mainicon from "../image/Mainicon.svg";
import Noticeicon from "../image/Noticeicon.svg";
import Commuicon from "../image/Commuicon.svg";
import Clubicon from "../image/Clubicon.svg";
import Mypageicon from "../image/Mypageicon.svg";
import Logouticon from "../image/Logouticon.svg";
import Profileimg from "../image/logo_black.png";

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
    userNameEnglish: "",
    profileImageUrl: "",
    isLoggedIn: false,
  });

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const memberId = localStorage.getItem("userId");
        if (!memberId) {
          console.log("No user ID found");
          return;
        }

        // API를 통해 최신 사용자 정보 가져오기
        console.log("Fetching user info for ID:", memberId);
        const response = await api.get(`/api/v1/members/${memberId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        console.log("Received user info:", response.data);
        const memberData = response.data;

        // 프로필 정보 업데이트
        setUserInfo({
          userName: memberData.name,
          userNameEnglish: memberData.nameEnglish,
          profileImageUrl: memberData.imageUrl, // CDN URL
          isLoggedIn: true,
        });

        // localStorage 업데이트
        localStorage.setItem("memberInfo", JSON.stringify(memberData));
        localStorage.setItem("memberName", memberData.name);
        localStorage.setItem("memberNameEnglish", memberData.nameEnglish);

        console.log("Updated user info:", {
          name: memberData.name,
          nameEnglish: memberData.nameEnglish,
          imageUrl: memberData.imageUrl,
        });
      } catch (error) {
        console.error("Failed to load user info:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
      }
    };

    loadUserInfo();
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
          <span className="user-name">
            {userInfo.userNameEnglish}({userInfo.userName})
          </span>
          님, <br />
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
          <img
            src={userInfo.profileImageUrl || Profileimg}
            alt="Profile"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = Profileimg;
            }}
            className="profile-image"
          />
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
