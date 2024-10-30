// usePatchMember.jsx
import { useState } from "react";
import api from "../api/config";

export const usePatchMember = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateMember = async (memberId, memberData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/api/v1/members/${memberId}`, {
        name: memberData.memberName,
        nameEnglish: memberData.memberNameEnglish,
        course: memberData.course,
      });

      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message || "회원 정보 수정 중 오류가 발생했습니다."
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateMember, isLoading, error };
};
