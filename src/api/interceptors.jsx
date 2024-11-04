import api from "./config";
//bug 수정완료
const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("kakaoId");
  localStorage.removeItem("nickname");
  localStorage.removeItem("memberName");
  localStorage.removeItem("memberNameEnglish");
  localStorage.removeItem("course");
  localStorage.removeItem("profileImage");
  localStorage.removeItem("memberInfo");

  document.cookie =
    "refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  delete api.defaults.headers.common["Authorization"];
  window.location.href = "/login";
};

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // refresh 토큰 갱신 요청이 실패한 경우
    if (
      originalRequest.url === "/api/v1/auth/refresh" &&
      error.response?.status === 401
    ) {
      console.log("Refresh token has expired");
      alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
      handleLogout();
      return Promise.reject(error);
    }

    // access 토큰이 만료되어 401이 발생하고, 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Access token expired, attempting to refresh...");

        const response = await api.post("/api/v1/auth/refresh", null, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (response.data?.accessToken) {
          // 새로운 access token 저장
          const newAccessToken = response.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          api.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        } else {
          throw new Error("Failed to get new access token");
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
