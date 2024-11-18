import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/config";
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

  const loadUserInfo = async () => {
    try {
      // 먼저 localStorage에서 기존 정보 불러오기
      const storedInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
      if (storedInfo.name) {
        setUserInfo({
          userName: storedInfo.name,
          userNameEnglish: storedInfo.nameEnglish,
          profileImageUrl: storedInfo.imageUrl?.path || storedInfo.imageUrl,
          isLoggedIn: true,
        });
      }

      const memberId = localStorage.getItem("userId");
      if (!memberId) {
        console.log("No user ID found");
        return;
      }

      console.log("Fetching user info for ID:", memberId);
      const response = await api.get(`/api/v1/members/${memberId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // 서버 응답 유효성 검사
      if (response.data?.error || response.data?.code) {
        console.log("Server returned an error:", response.data);
        return;
      }

      const memberData = response.data;
      if (!memberData) {
        console.log("No member data received");
        return;
      }

      // 새로운 API 응답 구조에 맞춰 데이터 처리
      const updatedInfo = {
        userName: memberData.name || storedInfo.name,
        userNameEnglish: memberData.nameEnglish || storedInfo.nameEnglish,
        profileImageUrl:
          memberData.imageUrl?.path ||
          storedInfo.imageUrl?.path ||
          storedInfo.imageUrl,
        isLoggedIn: true,
      };

      setUserInfo(updatedInfo);

      // localStorage 업데이트 - 새로운 구조로 저장
      const updatedMemberInfo = {
        ...storedInfo,
        name: memberData.name,
        nameEnglish: memberData.nameEnglish,
        course: memberData.course,
        imageUrl: memberData.imageUrl, // 전체 이미지 객체 저장
        imageId: memberData.imageUrl?.imageId, // imageId 별도 저장
      };

      localStorage.setItem("memberInfo", JSON.stringify(updatedMemberInfo));
      localStorage.setItem("memberName", memberData.name);
      localStorage.setItem("memberNameEnglish", memberData.nameEnglish);
      localStorage.setItem("course", memberData.course);

      console.log("User info updated successfully:", updatedMemberInfo);
    } catch (error) {
      console.error("Failed to load user info:", {
        error,
        message: error.message,
        response: error.response?.data,
      });

      // 에러 발생 시 localStorage의 데이터로 폴백
      const storedInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
      if (storedInfo.name) {
        setUserInfo({
          userName: storedInfo.name,
          userNameEnglish: storedInfo.nameEnglish,
          profileImageUrl: storedInfo.imageUrl?.path || storedInfo.imageUrl,
          isLoggedIn: true,
        });
      }
    }
  };

  useEffect(() => {
    loadUserInfo();

    const handleProfileUpdate = () => {
      console.log("Profile update event received");
      loadUserInfo();
    };

    window.addEventListener("profileImageUpdate", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileImageUpdate", handleProfileUpdate);
    };
  }, []);

  const handleLogoClick = () => {
    navigate("/mainpage");
  };

  const getWelcomeMessage = () => {
    if (userInfo.isLoggedIn && userInfo.userName) {
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
              console.log("Profile image load failed, using default");
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
