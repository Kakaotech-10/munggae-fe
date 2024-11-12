import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import Button from "../component/Button";
import Input from "../component/Input";
import ProfileUpload from "../component/ProfileUpload";
import { useChangeProfile } from "../api/useChangeProfile";
import "./styles/SettingForm.scss";

const SettingForm = () => {
  const navigate = useNavigate();
  const { updateProfile, isLoading, error } = useChangeProfile();
  const [formData, setFormData] = useState({
    name: "",
    nameEnglish: "",
    course: "",
    imageUrl: "",
  });

  useEffect(() => {
    // 초기 데이터 로드
    const memberInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
    setFormData({
      name: memberInfo.name || "",
      nameEnglish: memberInfo.nameEnglish || "",
      course: memberInfo.course || "",
      imageUrl: memberInfo.imageUrl || "",
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageUpdate = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: imageUrl,
    }));
  };

  const handleSubmit = async () => {
    try {
      const memberId = localStorage.getItem("userId");
      if (!memberId) {
        throw new Error("로그인 정보를 찾을 수 없습니다.");
      }

      if (!formData.name || !formData.nameEnglish) {
        throw new Error("이름을 모두 입력해주세요.");
      }

      const updatedProfile = await updateProfile(memberId, {
        ...formData,
      });

      if (updatedProfile) {
        // memberInfo 업데이트
        localStorage.setItem(
          "memberInfo",
          JSON.stringify({
            ...updatedProfile,
            imageUrl: formData.imageUrl, // 현재 이미지 URL 유지
          })
        );

        // SideForm 업데이트 이벤트 발생
        window.dispatchEvent(new Event("profileImageUpdate"));

        alert("프로필이 성공적으로 수정되었습니다.");
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      if (err.response?.status === 500) {
        // 서버 에러 시 기존 정보 유지하고 사용자에게 알림
        alert("서버 오류가 발생했지만, 로컬 정보는 유지됩니다.");
      } else {
        alert(err.message || "프로필 수정 중 오류가 발생했습니다.");
      }
    }
  };

  const handleChangePassword = () => {
    navigate("/setting/changepassword");
  };

  const handleMyPosts = () => {
    navigate("/myposts");
  };

  const handleWithdrawal = () => {
    if (window.confirm("정말 탈퇴하시겠습니까?")) {
      // 회원탈퇴 로직 구현
      console.log("회원탈퇴 로직 실행");
    }
  };

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="content-wrapper">
        <div className="search-area">
          <Search />
        </div>
        <div className="setting-area">
          <div className="signup-area">
            <h3>마이페이지</h3>
            <ProfileUpload
              initialImage={formData.imageUrl}
              onImageUpload={handleProfileImageUpdate}
            />
            <Input
              type="text"
              placeholder="아이디"
              disabled={true}
              value={localStorage.getItem("userId") || ""}
            />
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름(한글)"
            />
            <Input
              type="text"
              name="nameEnglish"
              value={formData.nameEnglish}
              onChange={handleInputChange}
              placeholder="이름(영문)"
            />

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button className="action-button" onClick={handleChangePassword}>
                비밀번호 변경
              </button>
              <button className="action-button" onClick={handleMyPosts}>
                내 게시물
              </button>
            </div>

            <Button
              text={isLoading ? "수정 중..." : "정보수정하기"}
              onClick={handleSubmit}
              disabled={isLoading}
            />
            <span
              className="Withdrawal"
              onClick={handleWithdrawal}
              role="button"
              tabIndex={0}
            >
              회원탈퇴하기
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingForm;
