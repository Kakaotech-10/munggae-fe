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
          { params: { code } }
        );

        console.log("Full response:", response);
        const data = response.data;

        // 서버 응답에서 memberId와 kakaoId, nickname 추출
        if (
          data.memberId &&
          data.kakaoId &&
          data.nickname &&
          data.token.accessToken
        ) {
          console.log("Login successful, storing tokens and user info");

          // 토큰 및 사용자 정보 저장
          localStorage.setItem("accessToken", data.token.accessToken);
          localStorage.setItem("userId", data.memberId); // memberId를 userId로 저장
          localStorage.setItem("kakaoId", data.kakaoId); // kakaoId 저장
          localStorage.setItem("nickname", data.nickname); // nickname 저장

          console.log("Stored data in localStorage:", {
            userId: localStorage.getItem("userId"),
            kakaoId: localStorage.getItem("kakaoId"),
            nickname: localStorage.getItem("nickname"),
          });

          // member_name_english나 course가 없는 경우에만 kakaosignup으로 이동
          if (data.memberNameEnglish && data.course) {
            window.location.href = "/mainpage";
          } else {
            window.location.href = "/kakaosignup";
          }
        } else {
          console.error("Missing required fields in response:", data);
          throw new Error("로그인 정보가 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("Detailed error information:", {
          message: error.message,
          responseData: error.response?.data,
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
