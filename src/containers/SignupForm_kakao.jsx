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

  const { uploadNewImage, isUploading, uploadError } = useUpdateProfile();

  const [formData, setFormData] = useState({
    member_name: "",
    member_name_english: "",
    course: "",
    profileImage: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getKakaoProfileImage = async () => {
    try {
      // Kakao SDK가 초기화되어 있는지 확인
      if (!window.Kakao) {
        console.error("Kakao SDK not loaded");
        return null;
      }

      // 현재 로그인 상태 확인
      if (!window.Kakao.Auth.getAccessToken()) {
        const accessToken = localStorage.getItem("accessToken");
        window.Kakao.Auth.setAccessToken(accessToken);
      }

      // 사용자 정보 요청
      const response = await window.Kakao.API.request({
        url: "/v2/user/me",
      });

      if (response?.properties?.profile_image) {
        return response.properties.profile_image;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch Kakao profile:", error);
      return null;
    }
  };

  // useEffect 내의 이미지 로딩 부분 수정
  useEffect(() => {
    const loadInitialData = async () => {
      const nickname = localStorage.getItem("nickname");
      const memberId = localStorage.getItem("userId");

      if (nickname) {
        setFormData((prev) => ({
          ...prev,
          member_name: nickname,
        }));
      }

      if (memberId) {
        try {
          const memberResponse = await api.get(`/api/v1/members/${memberId}`);
          const memberData = memberResponse.data;

          if (memberData) {
            setFormData((prev) => ({
              ...prev,
              member_name: memberData.name || nickname || "",
              member_name_english: memberData.nameEnglish || "",
              course: memberData.course || "",
            }));

            // 이미지 설정 우선순위: 서버 이미지 > 카카오 프로필 이미지
            if (memberData.imageUrl?.path) {
              setPreviewUrl(memberData.imageUrl.path);
            } else {
              const kakaoImageUrl = await getKakaoProfileImage();
              if (kakaoImageUrl) {
                setPreviewUrl(kakaoImageUrl);

                // 카카오 이미지를 파일로 변환
                try {
                  const imageResponse = await fetch(kakaoImageUrl);
                  if (!imageResponse.ok)
                    throw new Error("Failed to fetch image");

                  const blob = await imageResponse.blob();
                  const file = new File([blob], "kakao_profile.jpg", {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });

                  // S3에 업로드하기 위해 formData에 저장
                  setFormData((prev) => ({
                    ...prev,
                    profileImage: file,
                  }));
                } catch (imageError) {
                  console.error("Failed to process Kakao image:", imageError);
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to load member info:", error);
        }
      }
    };

    // Kakao SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init("YOUR_KAKAO_JAVASCRIPT_KEY"); // 실제 JavaScript 키로 교체 필요
    }

    loadInitialData();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
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

      // 이미지 업로드 처리
      let imageData = null;
      if (formData.profileImage) {
        try {
          const result = await uploadNewImage(memberId, formData.profileImage);
          if (result?.imageUrl) {
            imageData = result.imageUrl;
          }
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
        }
      }

      // Update member information
      const response = await api.patch(`/api/v1/members/${memberId}`, {
        name: formData.member_name,
        nameEnglish: formData.member_name_english,
        course: formData.course,
      });

      if (response.data) {
        // 현재 이미지 정보 가져오기
        const existingInfo = JSON.parse(
          localStorage.getItem("memberInfo") || "{}"
        );

        const memberInfo = {
          ...existingInfo,
          id: response.data.id,
          role: response.data.role,
          course: formData.course,
          name: formData.member_name,
          nameEnglish: formData.member_name_english,
          imageUrl: imageData || response.data.imageUrl,
        };

        localStorage.setItem("memberInfo", JSON.stringify(memberInfo));
        localStorage.setItem("memberName", formData.member_name);
        localStorage.setItem("memberNameEnglish", formData.member_name_english);
        localStorage.setItem("course", formData.course);

        window.dispatchEvent(new Event("profileImageUpdate"));

        navigate("/mainpage", {
          state: { memberInfo },
          replace: true,
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
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
