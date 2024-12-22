import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "./config";

const useGetMembers = () => {
  const { channelId } = useParams(); // Automatically get channelId from the current route
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  const loadMembers = async (customChannelId) => {
    // Use the custom channelId if provided, otherwise use the route parameter
    const currentChannelId = customChannelId || channelId;

    // Validate channelId
    if (!currentChannelId) {
      setError("채널 ID가 필요합니다.");
      setMembers([]);
      setCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/v1/members", {
        params: { channelId: currentChannelId }, // Explicitly pass channelId as a query parameter
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          Accept: "application/json;charset=UTF-8",
        },
      });

      // Destructure response according to API specification
      const { count: memberCount, members: memberList } = response.data;

      // Process members data
      const processedMembers = (memberList || []).map((member) => ({
        id: member.id,
        role: member.role,
        course: member.course,
        name: member.name,
        nameEnglish: member.nameEnglish,
        imageUrl: member.imageUrl?.path || "",
        displayName: `${member.nameEnglish}(${member.name})`,
      }));

      setMembers(processedMembers);
      setCount(memberCount);
      setError(null);
    } catch (error) {
      console.error("Failed to load members:", error);
      setError(
        error.response?.data?.message || "멤버 목록을 불러오는데 실패했습니다."
      );
      setMembers([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    members,
    count,
    loading,
    error,
    loadMembers,
    setMembers,
    channelId, // Expose channelId for convenience
  };
};

export default useGetMembers;
