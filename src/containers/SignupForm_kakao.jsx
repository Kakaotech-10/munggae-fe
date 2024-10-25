import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import Select from "../component/Select";
import ProfileUpload from "../component/ProfileUpload";
import "./styles/SignupForm.scss";

const SignupForm_kakao = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    koreanName: "",
    englishName: "",
    field: "",
    role: "",
    profileImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load kakao profile data from localStorage
    const kakaoNickname = localStorage.getItem("kakaoNickname");
    const kakaoProfileImage = localStorage.getItem("kakaoProfileImage");

    if (kakaoNickname) {
      setFormData((prev) => ({
        ...prev,
        koreanName: kakaoNickname,
      }));
    }

    if (kakaoProfileImage) {
      setFormData((prev) => ({
        ...prev,
        profileImage: kakaoProfileImage,
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

      // Validate form data
      if (
        !formData.koreanName ||
        !formData.englishName ||
        !formData.field ||
        !formData.role
      ) {
        throw new Error("모든 필드를 입력해주세요.");
      }

      // Send data to server
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_SERVER_URL}/api/signup`,
        {
          memberName: formData.koreanName,
          memberNameEnglish: formData.englishName,
          course: formData.field,
          role: formData.role,
          profileImage: formData.profileImage,
        }
      );

      if (response.data.success) {
        // Store necessary data in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("name", formData.koreanName);

        // Clear temporary kakao data
        localStorage.removeItem("kakaoNickname");
        localStorage.removeItem("kakaoProfileImage");

        navigate("/mainpage");
      }
    } catch (err) {
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
            name="koreanName"
            value={formData.koreanName}
            onChange={handleInputChange}
            placeholder="이름(한글)"
          />

          <Input
            type="text"
            name="englishName"
            value={formData.englishName}
            onChange={handleInputChange}
            placeholder="이름(영문)"
          />

          <Select
            name="field"
            value={formData.field}
            options={["풀스택", "클라우드", "인공지능"]}
            onChange={handleInputChange}
            placeholder="분야 선택"
          />

          <Select
            name="role"
            value={formData.role}
            options={["STUDENT", "MANAGER"]}
            onChange={handleInputChange}
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
