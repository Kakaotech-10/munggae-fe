import { useState } from "react";
import api from "../api/config";

const useCreateChannel = (onChannelCreated) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    allowStudents: false,
  });

  const handleAddChannel = (userRole) => {
    if (userRole !== "MANAGER") {
      setShowPermissionAlert(true);
      setTimeout(() => setShowPermissionAlert(false), 3000);
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateChannel = async () => {
    try {
      if (!newChannel.name.trim()) {
        alert("채널 이름을 입력해주세요.");
        return;
      }

      await api.post(
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

      setIsModalOpen(false);
      setNewChannel({ name: "", allowStudents: false });

      // Call the callback function to refresh the channels list
      if (onChannelCreated) {
        onChannelCreated();
      }
    } catch (error) {
      console.error("Failed to create channel:", error);
      alert("채널 생성에 실패했습니다.");
    }
  };

  const updateNewChannel = (field, value) => {
    setNewChannel((prev) => ({
      ...prev,
      [field]: value,
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
  };
};

export default useCreateChannel;
