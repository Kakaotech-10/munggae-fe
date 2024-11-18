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
      const response = await api.patch(
        `/api/v1/members/${memberId}`,
        memberData
      );

      if (!response.data) {
        throw new Error("회원 정보 업데이트에 실패했습니다.");
      }

      return {
        ...response.data,
        // 서버 응답 대신 사용자 입력 데이터 사용
        name: memberData.name,
        nameEnglish: memberData.nameEnglish,
        course: memberData.course,
      };
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
