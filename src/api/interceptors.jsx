import api from "./config";

const handleLogout = () => {
  // 로컬 스토리지의 모든 인증 관련 데이터 삭제
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("kakaoId");
  localStorage.removeItem("nickname");
  localStorage.removeItem("memberName");
  localStorage.removeItem("memberNameEnglish");
  localStorage.removeItem("course");
  localStorage.removeItem("profileImage");
  localStorage.removeItem("memberInfo");

  // Authorization 헤더 제거
  delete api.defaults.headers.common["Authorization"];

  // 로그인 페이지로 리다이렉트
  window.location.href = "/login";
};

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 모든 요청에 쿠키 포함 설정
    config.withCredentials = true;

    // 요청 헤더 로깅
    console.log("Request Headers:", config.headers);
    console.log("Request Cookies:", document.cookie);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("Response Error:", {
      status: error.response?.status,
      message: error.message,
      originalUrl: originalRequest.url,
    });

    // refresh 토큰 갱신 요청이 실패한 경우 (refresh 토큰 만료)
    if (
      originalRequest.url === "/v1/auth/refresh" &&
      error.response?.status === 401
    ) {
      console.log("Refresh token has expired");
      console.log("Current cookies:", document.cookie);
      alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
      handleLogout();
      return Promise.reject(error);
    }

    // access 토큰이 만료되어 401이 발생하고, 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Access token expired, attempting to refresh...");
        console.log("Current cookies before refresh:", document.cookie);

        // POST 메서드로 refresh 토큰 갱신 요청
        const response = await api.post("/v1/auth/refresh", null, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("Refresh token response:", {
          status: response.status,
          data: response.data,
          headers: response.headers,
        });

        if (!response.data.accessToken) {
          throw new Error("Failed to get new access token");
        }

        // 새로 받은 access token 저장 및 설정
        const newAccessToken = response.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        api.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.log("Successfully refreshed access token");
        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token:", {
          error: refreshError,
          response: refreshError.response?.data,
          status: refreshError.response?.status,
          headers: refreshError.response?.headers,
          cookies: document.cookie,
        });

        if (refreshError.response?.status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
          handleLogout();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
