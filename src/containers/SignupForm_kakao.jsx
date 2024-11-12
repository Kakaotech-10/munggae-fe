import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import Select from "../component/Select";
import api from "../api/config";
import { useGetCourse } from "../api/useGetCourse";
import { useUpdateProfile } from "../api/useUpdateProfile";
import "./styles/SignupForm.scss";

const SignupForm_kakao = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const {
    courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetCourse();

  const { updateProfileImage, getKakaoProfileImage, isUploading, uploadError } =
    useUpdateProfile();

  const [formData, setFormData] = useState({
    member_name: "",
    member_name_english: "",
    course: "",
    profileImage: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      const nickname = localStorage.getItem("nickname");
      const accessToken = localStorage.getItem("accessToken");
      const memberId = localStorage.getItem("userId");

      if (nickname) {
        setFormData((prev) => ({
          ...prev,
          member_name: nickname,
        }));
      }

      if (memberId) {
        try {
          // Get current member info including CDN image URL
          const memberResponse = await api.get(`/api/v1/members/${memberId}`);
          if (memberResponse.data.imageUrl) {
            setPreviewUrl(memberResponse.data.imageUrl);
          } else if (accessToken) {
            // If no profile image, try to get from Kakao
            const kakaoImageUrl = await getKakaoProfileImage(accessToken);
            if (kakaoImageUrl) {
              setPreviewUrl(kakaoImageUrl);
            }
          }
        } catch (error) {
          console.error("Failed to load profile image:", error);
        }
      }
    };

    loadInitialData();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (
        !formData.member_name ||
        !formData.member_name_english ||
        !formData.course
      ) {
        throw new Error("모든 필드를 입력해주세요.");
      }

      const memberId = localStorage.getItem("userId");
      if (!memberId) {
        throw new Error("회원 정보를 찾을 수 없습니다.");
      }

      // First update profile image if there's a new one
      let imageData = null;
      if (formData.profileImage) {
        imageData = await updateProfileImage(memberId, formData.profileImage);
      }

      // Update member information
      const response = await api.patch(`/api/v1/members/${memberId}`, {
        name: formData.member_name,
        nameEnglish: formData.member_name_english,
        course: formData.course,
        imageUrl: imageData?.s3ImagePath, // Include the CDN URL if we have one
      });

      if (response.data) {
        const memberInfo = {
          id: response.data.id,
          role: response.data.role,
          course: response.data.course,
          name: response.data.name,
          nameEnglish: response.data.nameEnglish,
          imageUrl: response.data.imageUrl,
        };

        localStorage.setItem("memberInfo", JSON.stringify(memberInfo));
        localStorage.setItem("memberName", formData.member_name);
        localStorage.setItem("memberNameEnglish", formData.member_name_english);
        localStorage.setItem("course", formData.course);

        navigate("/mainpage", {
          state: { memberInfo },
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      console.log("Detailed error:", {
        error: err,
        response: err.response,
        data: err.response?.data,
        currentUserId: localStorage.getItem("userId"),
        allStorage: {
          userId: localStorage.getItem("userId"),
          nickname: localStorage.getItem("nickname"),
          accessToken: localStorage.getItem("accessToken"),
          memberName: localStorage.getItem("memberName"),
          memberNameEnglish: localStorage.getItem("memberNameEnglish"),
          course: localStorage.getItem("course"),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const courseOptions = courses.map((course) => {
    switch (course) {
      case "풀스택":
        return "FULLSTACK";
      case "클라우드":
        return "CLOUD";
      case "인공지능":
        return "AI";
      default:
        return course;
    }
  });

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar showLogout={false} />
      </div>
      <div className="content-wrapper">
        <div className="signup-area">
          <div className="profile-image-section">
            <div
              className="profile-image-container"
              onClick={handleImageClick}
              style={{ cursor: "pointer" }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="profile-preview"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "75px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div className="profile-placeholder">프로필 이미지 선택</div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
            <button
              className="change-photo-btn"
              onClick={handleImageClick}
              disabled={isUploading}
            >
              {isUploading ? "업로드 중..." : "사진 변경"}
            </button>
          </div>

          <Input
            type="text"
            name="member_name"
            value={formData.member_name}
            onChange={handleInputChange}
            placeholder="이름(한글)"
          />

          <Input
            type="text"
            name="member_name_english"
            value={formData.member_name_english}
            onChange={handleInputChange}
            placeholder="이름(영문)"
          />

          <Select
            options={courseOptions}
            onChange={handleCourseChange}
            placeholder={coursesLoading ? "로딩 중..." : "분야 선택"}
            disabled={coursesLoading}
          />

          {(error || coursesError || uploadError) && (
            <p className="error-message">
              {error || coursesError || uploadError}
            </p>
          )}

          <Button
            text={isLoading ? "처리중..." : "정보 입력"}
            onClick={handleSubmit}
            disabled={isLoading || coursesLoading || isUploading}
          />
        </div>
      </div>
    </div>
  );
};

export default SignupForm_kakao;
