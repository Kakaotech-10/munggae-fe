// useGetCourse.jsx
import { useState, useEffect } from "react";
import api from "../api/config";

export const useGetCourse = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/api/v1/members/course");
        setCourses(response.data.courses);
        setError(null);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("코스 목록을 불러오는데 실패했습니다.");
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, isLoading, error };
};
