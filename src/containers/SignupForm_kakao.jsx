import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./SideForm";
import Button from "../component/Button";
import Input from "../component/Input";
import Select from "../component/Select";
import api from "../api/config";
import "./styles/SignupForm.scss";
import { useGetCourse } from "../api/useGetCourse";

const SignupForm_kakao = () => {
  const navigate = useNavigate();
  const {
    courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetCourse();

  const [formData, setFormData] = useState({
    member_name: "",
    member_name_english: "",
    course: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // localStorage에서 사용자 기본 정보 가져오기
    const nickname = localStorage.getItem("nickname");
    if (nickname) {
      setFormData((prev) => ({
        ...prev,
        member_name: nickname,
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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 입력값 검증
      if (
        !formData.member_name ||
        !formData.member_name_english ||
        !formData.course
      ) {
        throw new Error("모든 필드를 입력해주세요.");
      }

      // localStorage에서 memberId 가져오기
      const memberId = localStorage.getItem("userId");
      console.log("Current memberId:", memberId); // 디버깅용

      if (!memberId) {
        throw new Error("회원 정보를 찾을 수 없습니다.");
      }

      // API 명세에 맞게 회원 정보 업데이트
      const response = await api.patch(`/api/v1/members/${memberId}`, {
        name: formData.member_name,
        nameEnglish: formData.member_name_english,
        course: formData.course,
      });

      if (response.data) {
        // 응답 데이터 저장
        const memberInfo = {
          id: response.data.id,
          role: response.data.role,
          course: response.data.course,
          name: response.data.name,
          nameEnglish: response.data.nameEnglish,
        };

        // localStorage에 업데이트된 정보 저장
        localStorage.setItem("memberInfo", JSON.stringify(memberInfo));

        // 메인 페이지로 이동
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
        currentUserId: localStorage.getItem("userId"), // 현재 저장된 userId 확인
        allStorage: {
          // 모든 localStorage 데이터 확인
          userId: localStorage.getItem("userId"),
          nickname: localStorage.getItem("nickname"),
          accessToken: localStorage.getItem("accessToken"),
        },
      });
    } finally {
      setIsLoading(false);
    }
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

          {(error || coursesError) && (
            <p className="error-message">{error || coursesError}</p>
          )}

          <Button
            text={isLoading ? "처리중..." : "정보 입력"}
            onClick={handleSubmit}
            disabled={isLoading || coursesLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default SignupForm_kakao;
