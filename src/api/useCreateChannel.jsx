import { useState } from "react";
import api from "../api/config";

const useCreateChannel = (onChannelCreated) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    allowStudents: false,
    memberIds: [],
  });

  const handleAddChannel = (userRole) => {
    if (userRole !== "MANAGER") {
      setShowPermissionAlert(true);
      setTimeout(() => setShowPermissionAlert(false), 3000);
      return;
    }
    setIsModalOpen(true);
  };

  const addMembersToChannel = async (channelId, memberIds) => {
    try {
      await api.post(
        `/api/v1/channels/${channelId}/members`,
        {
          memberIds: memberIds,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log("Members added to channel successfully");
    } catch (error) {
      console.error("Failed to add members to channel:", error);
      throw new Error("멤버 추가에 실패했습니다.");
    }
  };

  const handleCreateChannel = async () => {
    try {
      if (!newChannel.name.trim()) {
        alert("채널 이름을 입력해주세요.");
        return;
      }

      if (newChannel.memberIds.length === 0) {
        alert("최소 한 명 이상의 멤버를 선택해주세요.");
        return;
      }

      const response = await api.post(
        "/api/v1/channels",
        {
          name: newChannel.name,
          allowStudents: newChannel.allowStudents,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const channelId = response.data.id;
      console.log("Channel created with ID:", channelId);

      await addMembersToChannel(channelId, newChannel.memberIds);

      setIsModalOpen(false);
      setNewChannel({
        name: "",
        allowStudents: false,
        memberIds: [],
      });

      if (onChannelCreated) {
        onChannelCreated();
      }
    } catch (error) {
      console.error("Channel creation or member addition failed:", error);
      alert(error.message || "채널 생성에 실패했습니다.");
    }
  };

  const updateNewChannel = (field, value) => {
    setNewChannel((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMemberToggle = (memberId) => {
    setNewChannel((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }));
  };

  const handleSelectAllMembers = (memberIds) => {
    setNewChannel((prev) => ({
      ...prev,
      memberIds: prev.memberIds.length === memberIds.length ? [] : memberIds,
    }));
  };

  return {
    isModalOpen,
    setIsModalOpen,
    showPermissionAlert,
    setShowPermissionAlert,
    newChannel,
    handleAddChannel,
    handleCreateChannel,
    updateNewChannel,
    handleMemberToggle,
    handleSelectAllMembers,
  };
};

export default useCreateChannel;
