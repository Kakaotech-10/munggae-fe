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

      // 멤버 데이터 가공
      const processedMembers = response.data.map((member) => ({
        ...member,
        displayName: `${member.nameEnglish}(${member.name})`,
      }));

      // 중복 제거를 위해 Set 사용 (id 기준)
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
