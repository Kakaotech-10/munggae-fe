import { useEffect, useRef } from "react";
import api from "../api/config";

export default function KakaoLogin() {
  const processedRef = useRef(false);

  useEffect(() => {
    const kakaoLogin = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      try {
        const code = new URL(window.location.href).searchParams.get("code");

        if (!code) {
          console.error("No authorization code found");
          window.location.href = "/login";
          return;
        }

        console.log("Starting login with code:", code);

        const response = await api.get(
          `/api/v1/auth/login/oauth2/callback/kakao`,
          {
            params: { code },
          }
        );

        console.log("Full response:", response);
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
        console.log("Response data:", response.data);

        const data = response.data;

        // 서버 에러 응답 상세 로깅
        if (data.code === "COM_001" || data.status === 500) {
          console.error("Server Error Details:", {
            code: data.code,
            status: data.status,
            message: data.message,
            fullData: data,
          });
          throw new Error(
            "로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.\n" +
              (data.message || "알 수 없는 오류가 발생했습니다.")
          );
        }

        if (data.token && data.token.accessToken) {
          console.log("Login successful, storing tokens and user info");
          localStorage.setItem("accessToken", data.token.accessToken);
          if (data.id) localStorage.setItem("userId", data.id);
          if (data.nickname) localStorage.setItem("nickname", data.nickname);

          if (data.isRegistered) {
            // 이미 회원가입된 사용자의 경우, 메인 페이지로 이동
            window.location.href = "/mainpage";
          } else {
            // 회원가입이 안 된 사용자의 경우, 추가 정보 입력 페이지로 이동
            window.location.href = "/kakaosignup";
          }
        } else {
          console.error("Missing access token in response:", data);
          throw new Error("로그인 정보가 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("Detailed error information:", {
          message: error.message,
          responseData: error.response?.data,
          responseStatus: error.response?.status,
          responseHeaders: error.response?.headers,
          originalError: error,
          errorStack: error.stack,
        });

        let errorMessage =
          "카카오 로그인 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        alert(errorMessage);
        window.location.href = "/login";
      }
    };

    kakaoLogin();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">카카오 로그인 처리중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
