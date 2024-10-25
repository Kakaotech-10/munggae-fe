import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import Select from "../component/Select";
import ProfileUpload from "../component/ProfileUpload";
import api from "../api/config"; // api instance 사용
import "./styles/SignupForm.scss";

const SignupForm_kakao = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    memberName: "",
    memberNameEnglish: "",
    course: "",
    role: "",
    profileImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 카카오 데이터 불러오기
    const tempUserData = JSON.parse(
      localStorage.getItem("tempUserData") || "{}"
    );
    if (tempUserData.nickname) {
      setFormData((prev) => ({
        ...prev,
        memberName: tempUserData.nickname,
      }));
    }
    if (tempUserData.profileImage) {
      setFormData((prev) => ({
        ...prev,
        profileImage: tempUserData.profileImage,
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      course: e.target.value,
    }));
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value,
    }));
  };

  const handleProfileUpload = (imageData) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: imageData,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 입력값 검증
      if (
        !formData.memberName ||
        !formData.memberNameEnglish ||
        !formData.course ||
        !formData.role
      ) {
        throw new Error("모든 필드를 입력해주세요.");
      }

      const tempUserData = JSON.parse(
        localStorage.getItem("tempUserData") || "{}"
      );

      // 서버로 회원가입 요청
      const response = await api.post("/auth/signup", {
        kakaoId: tempUserData.kakaoId,
        memberName: formData.memberName,
        memberNameEnglish: formData.memberNameEnglish,
        course: formData.course,
        role: formData.role,
        profileImage: formData.profileImage,
      });

      // 회원가입 성공 처리
      if (response.data.token) {
        // 토큰 저장
        localStorage.setItem("accessToken", response.data.token.accessToken);
        localStorage.setItem(
          "tokenType",
          response.data.token.grantType || "Bearer"
        );
        if (response.data.token.refreshToken) {
          localStorage.setItem(
            "refreshToken",
            response.data.token.refreshToken
          );
        }

        // 사용자 정보 저장
        localStorage.setItem("userId", response.data.id);
        localStorage.setItem("nickname", formData.memberName);

        // 임시 데이터 삭제
        localStorage.removeItem("tempUserData");

        navigate("/mainpage");
      } else {
        throw new Error("회원가입 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar showLogout={false} />
      </div>
      <div className="content-wrapper">
        <div className="signup-area">
          <ProfileUpload
            initialImage={formData.profileImage}
            onImageUpload={handleProfileUpload}
          />

          <Input
            type="text"
            name="memberName"
            value={formData.memberName}
            onChange={handleInputChange}
            placeholder="이름(한글)"
          />

          <Input
            type="text"
            name="memberNameEnglish"
            value={formData.memberNameEnglish}
            onChange={handleInputChange}
            placeholder="이름(영문)"
          />

          <Select
            options={["풀스택", "클라우드", "인공지능"]}
            onChange={handleCourseChange}
            placeholder="분야 선택"
          />

          <Select
            options={["STUDENT", "MANAGER"]}
            onChange={handleRoleChange}
            placeholder="역할 선택"
          />

          {error && <p className="error-message">{error}</p>}

          <Button
            text={isLoading ? "처리중..." : "회원가입"}
            onClick={handleSubmit}
            disabled={isLoading}
          />

          <p className="re-login" onClick={handleLogin}>
            아이디로 로그인
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm_kakao;
