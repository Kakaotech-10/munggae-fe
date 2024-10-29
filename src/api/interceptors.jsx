// interceptors.jsx
import api from "./config";

// Request Interceptor - 모든 요청에 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - 401 에러 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 재발급 요청
        const { data } = await api.post("/v1/auth/refresh");
        const newAccessToken = data.accessToken;

        // 새 액세스 토큰 저장
        localStorage.setItem("accessToken", newAccessToken);
        api.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
