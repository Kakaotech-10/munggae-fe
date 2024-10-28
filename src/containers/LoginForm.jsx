import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import api from "../api/config";

const LoginHandler = () => {
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleKakaoLogin = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      try {
        const code = new URL(window.location.href).searchParams.get("code");

        if (!code) {
          throw new Error("인가 코드를 찾을 수 없습니다.");
        }

        console.log("Received auth code:", code);

        const response = await api.get("/v1/auth/login/oauth2/callback/kakao", {
          params: { code },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("Login response:", response.data);

        const { data } = response;

        if (data.accessToken) {
          // 토큰 저장
          localStorage.setItem("accessToken", data.accessToken);

          // 사용자 정보 저장
          if (data.id) localStorage.setItem("userId", data.id);
          if (data.nickname) localStorage.setItem("nickname", data.nickname);

          // 추가 정보 입력이 필요한 경우
          navigate("/kakaosignup");
        } else {
          throw new Error("로그인 응답에 토큰이 없습니다.");
        }
      } catch (error) {
        console.error("Login error:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/login");
      }
    };

    handleKakaoLogin();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">카카오 로그인 처리중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default LoginHandler;
