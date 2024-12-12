// useRanking.jsx
import { useState, useEffect } from "react";
import api from "./config";

export const useRanking = () => {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data } = await api.get("/api/v1/keywords/ranking");

        // If data is an array directly
        const rankingsData = Array.isArray(data) ? data : [];

        // Transform the data to include count for visualization
        const transformedData = rankingsData.map((item) => ({
          rank: item.rank,
          topic: item.keyword,
          count: 100 - (item.rank - 1) * 20, // Creates a visual scale: 100%, 80%, 60%
        }));

        setRankings(transformedData);
      } catch (err) {
        console.error("Error fetching rankings:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  return { rankings, isLoading, error };
};
