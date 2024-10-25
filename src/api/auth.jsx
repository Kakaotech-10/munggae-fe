// src/api/auth.js
import api from "./config";

export const kakaoLogin = async (code) => {
  try {
    // URL 경로 수정
    const response = await api.get("/auth/login/oauth2/callback/kakao", {
      params: { code },
    });
    return response;
  } catch (error) {
    console.error("Kakao login error:", error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/refresh", {
      refreshToken: localStorage.getItem("refreshToken"),
    });
    return response.data;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      await api.post("/logout", {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.clear();
  }
};
