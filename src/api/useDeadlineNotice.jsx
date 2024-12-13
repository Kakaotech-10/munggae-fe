// src/api/useDeadlineNotice.jsx
import { useState, useEffect } from "react";
import api from "./config";

export const useDeadlineNotice = () => {
  const [notices, setNotices] = useState([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(
          "/api/v1/posts/announcements/near-deadline"
        );
        // Make sure we're setting an empty array if content is undefined
        setNotices(response.data?.content || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setNotices([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return { notices, isLoading, error };
};
