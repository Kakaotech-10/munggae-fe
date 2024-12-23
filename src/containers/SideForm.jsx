import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../api/config";
import useCreateChannel from "../api/useCreateChannel";
import useGetChannels from "../api/useGetChannel";
// 이미지 imports
import Logo from "../image/logo.png";
import Studyicon from "../image/Studyicon.svg";
import Mainicon from "../image/Mainicon.svg";
import Clubicon from "../image/Clubicon.svg";
import Mypageicon from "../image/Mypageicon.svg";
import Logouticon from "../image/Logouticon.svg";
import Profileimg from "../image/logo_black.png";

// 컴포넌트 imports
import CustomModal from "../component/CustomModal";
import { CustomButton } from "../component/CustomButton";
import { CustomInput } from "../component/CustomInput";
import CustomAlert from "../component/CustomAlert";

import "./styles/SideForm.scss";

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

const SideForm = ({ showLogout = true }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userName: "",
    userNameEnglish: "",
    profileImageUrl: "",
    isLoggedIn: false,
    role: "",
  });

  const {
    channels,
    loading: channelsLoading,
    loadUserChannels,
  } = useGetChannels();

  const {
    isModalOpen,
    setIsModalOpen,
    showPermissionAlert,
    setShowPermissionAlert,
    newChannel,
    handleAddChannel,
    handleCreateChannel,
    updateNewChannel,
  } = useCreateChannel(() => loadUserChannels());

  const loadUserInfo = async () => {
    try {
      const storedInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
      if (storedInfo.name) {
        setUserInfo({
          userName: storedInfo.name,
          userNameEnglish: storedInfo.nameEnglish,
          profileImageUrl: storedInfo.imageUrl?.path || storedInfo.imageUrl,
          isLoggedIn: true,
          role: storedInfo.role,
        });
      }

      const memberId = localStorage.getItem("userId");
      if (!memberId) {
        console.log("No user ID found");
        return;
      }

      const response = await api.get(`/api/v1/members/${memberId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.data?.error || response.data?.code) {
        console.log("Server returned an error:", response.data);
        return;
      }

      const memberData = response.data;
      if (!memberData) {
        console.log("No member data received");
        return;
      }

      const updatedInfo = {
        userName: memberData.name || storedInfo.name,
        userNameEnglish: memberData.nameEnglish || storedInfo.nameEnglish,
        profileImageUrl:
          memberData.imageUrl?.path ||
          storedInfo.imageUrl?.path ||
          storedInfo.imageUrl,
        isLoggedIn: true,
        role: memberData.role,
      };

      setUserInfo(updatedInfo);

      const updatedMemberInfo = {
        ...storedInfo,
        name: memberData.name,
        nameEnglish: memberData.nameEnglish,
        course: memberData.course,
        imageUrl: memberData.imageUrl,
        imageId: memberData.imageUrl?.imageId,
        role: memberData.role,
      };

      localStorage.setItem("memberInfo", JSON.stringify(updatedMemberInfo));
      localStorage.setItem("memberName", memberData.name);
      localStorage.setItem("memberNameEnglish", memberData.nameEnglish);
      localStorage.setItem("course", memberData.course);
    } catch (error) {
      console.error("Failed to load user info:", error);
      const storedInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
      if (storedInfo.name) {
        setUserInfo({
          userName: storedInfo.name,
          userNameEnglish: storedInfo.nameEnglish,
          profileImageUrl: storedInfo.imageUrl?.path || storedInfo.imageUrl,
          isLoggedIn: true,
          role: storedInfo.role,
        });
      }
    }
  };

  useEffect(() => {
    loadUserInfo();
    loadUserChannels();

    const handleProfileUpdate = () => {
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

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.log("No refresh token found");
        clearUserData();
        navigate("/login");
        return;
      }

      await api.post("/api/v1/auth/logout", null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Refresh-Token": refreshToken,
        },
      });

      clearUserData();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      clearUserData();
      navigate("/login");
    }
  };

  const clearUserData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("memberInfo");
    localStorage.removeItem("memberName");
    localStorage.removeItem("memberNameEnglish");
    localStorage.removeItem("course");

    setUserInfo({
      userName: "",
      userNameEnglish: "",
      profileImageUrl: "",
      isLoggedIn: false,
      role: "",
    });
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
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleLogoClick();
          }
        }}
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

          {!channelsLoading &&
            channels &&
            channels.length > 0 &&
            channels.map((channel) => (
              <NavItem
                key={channel.id}
                icon={Clubicon}
                alt={channel.name}
                text={channel.name}
                path={`/channel/${channel.id}`}
              />
            ))}

          <NavItem
            icon={Mypageicon}
            alt="My Page"
            text="마이페이지"
            path="/setting"
          />

          {showLogout && userInfo.isLoggedIn && (
            <li>
              <div
                className="nav-item logout"
                onClick={handleLogout}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLogout();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <img src={Logouticon} alt="Logout" />
                <span className="nav-text">로그아웃</span>
              </div>
            </li>
          )}

          <li>
            <div
              className="nav-item add-channel"
              onClick={() => handleAddChannel(userInfo.role)}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleAddChannel(userInfo.role);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <span className="nav-text">채널 추가</span>
            </div>
          </li>
        </ul>
      </nav>

      {showPermissionAlert && (
        <CustomAlert
          title="권한 없음"
          message="채널을 추가하려면 Manager 권한이 필요합니다."
          onClose={() => setShowPermissionAlert(false)}
        />
      )}

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="새 채널 생성"
        description="새로운 채널의 정보를 입력해주세요."
        footer={
          <>
            <CustomButton
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </CustomButton>
            <CustomButton onClick={handleCreateChannel}>생성하기</CustomButton>
          </>
        }
      >
        <div className="channel-form">
          <CustomInput
            id="channelName"
            label="채널 이름"
            value={newChannel.name}
            onChange={(e) => updateNewChannel("name", e.target.value)}
          />
        </div>
      </CustomModal>
    </div>
  );
};

SideForm.propTypes = {
  showLogout: PropTypes.bool,
};

SideForm.defaultProps = {
  showLogout: true,
};

export default SideForm;
