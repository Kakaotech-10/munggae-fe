// useGetChannels.js
import { useState } from "react";
import api from "../api/config";

const useGetChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserChannels = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.log("No user ID found");
        setChannels([]);
        return;
      }

      const response = await api.get("/api/v1/channels", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      console.log("Original Channel Response:", response.data);

      const channelData = Array.isArray(response.data) ? response.data : [];

      const processedChannels = channelData.map((channel) => ({
        id: channel.id,
        name: channel.name,
        channel_name: channel.name,
        members: channel.members || [],
      }));

      const uniqueChannels = Array.from(
        new Map(
          processedChannels.map((channel) => [channel.id, channel])
        ).values()
      );

      console.log("Processed Unique Channels:", uniqueChannels);

      setChannels(uniqueChannels);
      setError(null);
    } catch (error) {
      console.error("Failed to load channels:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        setError(
          error.response.data.message || "채널 목록을 불러오는데 실패했습니다."
        );
      } else {
        setError("채널 목록을 불러오는데 실패했습니다.");
      }
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    channels,
    loading,
    error,
    loadUserChannels,
    setChannels,
  };
};

export default useGetChannels;
