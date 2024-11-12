import { useState } from "react";
import api from "../api/config";

export const useChangeProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (memberId, profileData) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentMemberInfo = JSON.parse(
        localStorage.getItem("memberInfo") || "{}"
      );

      const response = await api.patch(
        `/api/v1/members/${memberId}`,
        {
          name: profileData.name,
          nameEnglish: profileData.nameEnglish,
          course: profileData.course,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data) {
        // 서버 응답이 성공적인 경우
        const updatedMemberInfo = {
          ...currentMemberInfo,
          name: response.data.name,
          nameEnglish: response.data.nameEnglish,
          course: response.data.course,
          imageUrl: currentMemberInfo.imageUrl, // 기존 이미지 URL 유지
        };

        localStorage.setItem("memberInfo", JSON.stringify(updatedMemberInfo));
        localStorage.setItem("memberName", response.data.name);
        localStorage.setItem("memberNameEnglish", response.data.nameEnglish);
        localStorage.setItem("course", response.data.course);

        return updatedMemberInfo;
      }
    } catch (err) {
      console.error("Profile update error:", {
        error: err,
        response: err.response?.data,
      });

      if (err.response?.status === 500) {
        // 서버 에러 시 기존 정보 유지
        const currentInfo = JSON.parse(
          localStorage.getItem("memberInfo") || "{}"
        );
        return currentInfo;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "프로필 수정 중 오류가 발생했습니다."
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    isLoading,
    error,
  };
};
