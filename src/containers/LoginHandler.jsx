import { useEffect, useRef } from "react";
import api from "../api/config";

export default function LoginHandler() {
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

        const { data } = response;

        if (!data || !data.token || !data.token.accessToken) {
          throw new Error("로그인 정보가 올바르지 않습니다.");
        }

        // 토큰 및 사용자 정보 저장
        localStorage.setItem("accessToken", data.token.accessToken);
        if (data.id) localStorage.setItem("userId", data.id);
        if (data.nickname) localStorage.setItem("nickname", data.nickname);

        // 추가 회원 정보 입력 필요 여부 확인
        // 서버 응답에 따라 조건을 수정해야 할 수 있습니다
        const needsAdditionalInfo = checkNeedsAdditionalInfo(data);

        if (needsAdditionalInfo) {
          // 추가 정보 입력이 필요한 경우
          window.location.href = "/kakaosignup";
        } else {
          // 회원가입/로그인이 완료된 경우
          window.location.href = "/mainpage";
        }
      } catch (error) {
        console.error("Login error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "카카오 로그인 처리 중 오류가 발생했습니다.";

        alert(errorMessage);
        window.location.href = "/login";
      }
    };

    kakaoLogin();
  }, []);

  // 추가 정보 입력 필요 여부 확인 함수
  const checkNeedsAdditionalInfo = (data) => {
    // 서버 응답 구조에 따라 이 부분을 수정하세요
    // 예: 필수 필드들이 모두 있는지 확인
    const requiredFields = [
      "nickname",
      // 다른 필수 필드들을 여기에 추가
      // 'email',
      // 'phoneNumber',
      // 등등
    ];

    return requiredFields.some((field) => !data[field]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">카카오 로그인 처리중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
