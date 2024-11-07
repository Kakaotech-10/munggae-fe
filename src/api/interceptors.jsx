import api from "./config";

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

// 토큰 만료 체크 함수
const isTokenExpired = (error) => {
  const status = error.response?.status;
  const errorCode = error.response?.data?.code;
  const errorMessage = error.response?.data?.message;

  return (
    status === 401 &&
    (errorCode === "JWT_003" ||
      errorMessage?.includes("만료된 토큰") ||
      errorMessage?.includes("expired token"))
  );
};

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // refresh 토큰 갱신 요청이 실패한 경우
    if (
      originalRequest.url === "/api/v1/auth/refresh" &&
      (error.response?.status === 401 ||
        error.response?.data?.code === "JWT_003")
    ) {
      console.log("Refresh token has expired:", {
        status: error.response?.status,
        code: error.response?.data?.code,
        message: error.response?.data?.message,
      });
      alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
      handleLogout();
      return Promise.reject(error);
    }

    // access 토큰이 만료되고 아직 재시도하지 않은 경우
    if (isTokenExpired(error) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Token expired, attempting to refresh...", {
          status: error.response?.status,
          code: error.response?.data?.code,
          message: error.response?.data?.message,
        });

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

          console.log("Token refresh successful, retrying original request");
          return api(originalRequest);
        } else {
          console.error("Refresh response did not contain access token");
          throw new Error("Failed to get new access token");
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", {
          status: refreshError.response?.status,
          code: refreshError.response?.data?.code,
          message: refreshError.response?.data?.message,
        });

        if (refreshError.response?.data?.code === "JWT_003") {
          console.log("JWT_003 error during refresh attempt");
        }

        alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // 다른 종류의 에러인 경우 원본 에러 반환
    return Promise.reject(error);
  }
);

export default api;
