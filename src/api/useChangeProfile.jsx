import { useState } from "react";
import api from "../api/config";

export const useChangeProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateImage = async (memberId, imageId, imageInfo) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.put(
        `/api/v1/members/${memberId}/images/${imageId}`,
        {
          imageInfo: {
            fileName: imageInfo.fileName,
            url: imageInfo.url,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data) {
        const currentMemberInfo = JSON.parse(
          localStorage.getItem("memberInfo") || "{}"
        );

        // 이미지 정보 업데이트
        const updatedMemberInfo = {
          ...currentMemberInfo,
          imageUrl: response.data.s3ImagePath,
        };

        localStorage.setItem("memberInfo", JSON.stringify(updatedMemberInfo));
        return updatedMemberInfo;
      }
    } catch (err) {
      console.error("Image update error:", {
        error: err,
        response: err.response?.data,
      });
      setError(
        err.response?.data?.message ||
          err.message ||
          "이미지 수정 중 오류가 발생했습니다."
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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
        const updatedMemberInfo = {
          ...currentMemberInfo,
          name: response.data.name,
          nameEnglish: response.data.nameEnglish,
          course: response.data.course,
          imageUrl: currentMemberInfo.imageUrl,
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
    updateImage,
    isLoading,
    error,
  };
};
