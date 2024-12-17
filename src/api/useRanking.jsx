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

        // Check if data and keywordRankings exist
        if (data && data.keywordRankings) {
          const transformedData = data.keywordRankings.map((item) => ({
            rank: item.rank,
            topic: item.keyword,
            count: 100 - (item.rank - 1) * 20,
          }));
          setRankings(transformedData);
        } else {
          // If data structure is not as expected, set empty array
          console.warn("Unexpected API response structure:", data);
          setRankings([]);
        }
      } catch (err) {
        console.error("Error fetching rankings:", err);
        setError(err.response?.data?.message || err.message);
        setRankings([]); // Ensure rankings is at least an empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  return { rankings, isLoading, error };
};
