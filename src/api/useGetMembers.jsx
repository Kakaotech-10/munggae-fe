// useGetMembers.jsx
import { useState } from "react";
import api from "../api/config";

const useGetMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMembers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/v1/members", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      console.log("Original Members Response:", response.data);

      // 응답 데이터가 배열이 아닌 경우 처리
      const membersArray = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];

      // 멤버 데이터 가공 - 안전한 접근
      const processedMembers = membersArray.map((member) => ({
        id: member?.id || 0,
        name: member?.name || "",
        nameEnglish: member?.nameEnglish || "",
        role: member?.role || "",
        course: member?.course || "",
        imageUrl: member?.imageUrl?.path || "",
        displayName: `${member?.nameEnglish || ""}(${member?.name || ""})`,
      }));

      // 중복 제거
      const uniqueMembers = Array.from(
        new Map(processedMembers.map((member) => [member.id, member])).values()
      );

      console.log("Processed Unique Members:", uniqueMembers);

      setMembers(uniqueMembers);
      setError(null);
    } catch (error) {
      console.error("Failed to load members:", error);
      setError("멤버 목록을 불러오는데 실패했습니다.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    members,
    loading,
    error,
    loadMembers,
    setMembers,
  };
};

export default useGetMembers;
