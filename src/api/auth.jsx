// src/api/auth.js
import api from "./config";

export const kakaoLogin = async (code) => {
  try {
    console.log("Sending auth code to backend:", code);

    const response = await api.get("/v1/auth/login/oauth2/callback/kakao", {
      params: { code }, // redirectUri 제거
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("Backend response:", response);

    const { data } = response;
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      api.defaults.headers.common["Authorization"] =
        `Bearer ${data.accessToken}`;
    }

    return data;
  } catch (error) {
    console.error("Kakao login API error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/v1/auth/refresh");
    const { accessToken } = response.data;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }

    return response.data;
  } catch (error) {
    console.error("Token refresh error:", error);
    window.location.href = "/login";
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post("/v1/auth/logout");
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
  } catch (error) {
    console.error("Logout error:", error);
    // 에러가 발생해도 로컬의 토큰은 삭제
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
  }
};

export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_REACT_APP_REST_API_KEY}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_REACT_APP_REDIRECT_URL)}&response_type=code`;

// URL 생성 확인을 위한 로그
console.log("Generated KAKAO_AUTH_URL:", KAKAO_AUTH_URL);
