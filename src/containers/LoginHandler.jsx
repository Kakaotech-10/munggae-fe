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

        // 로그인 요청
        const response = await api.get(
          `/api/v1/auth/login/oauth2/callback/kakao`,
          {
            params: { code },
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        // 응답 상세 로깅
        console.log("Login response status:", response.status);
        console.log("Login response headers:", response.headers);
        console.log("Set-Cookie header:", response.headers["set-cookie"]);
        console.log("Login response data:", response.data);

        const data = response.data;
        console.log("Token data:", data.token);

        // refresh token을 응답 데이터에서 직접 가져와서 쿠키에 설정
        if (data.token?.refreshToken) {
          const cookieOptions = [
            `refresh-token=${data.token.refreshToken}`,
            "path=/",
            "SameSite=Lax",
            import.meta.env.PROD ? "Secure" : "", // process.env 대신 import.meta.env 사용
          ]
            .filter(Boolean)
            .join("; ");

          document.cookie = cookieOptions;
          console.log("Manually set refresh-token cookie");
        } else {
          console.warn("No refresh token in response data");
        }

        // 쿠키 설정 확인
        console.log("Cookies after setting:", document.cookie);

        if (
          data.memberId &&
          data.kakaoId &&
          data.nickname &&
          data.token?.accessToken
        ) {
          // Access Token 저장
          localStorage.setItem("accessToken", data.token.accessToken);
          localStorage.setItem("userId", data.memberId);
          localStorage.setItem("kakaoId", data.kakaoId);
          localStorage.setItem("nickname", data.nickname);

          // axios 기본 헤더 설정
          api.defaults.headers.common["Authorization"] =
            `Bearer ${data.token.accessToken}`;

          if (data.memberNameEnglish && data.course) {
            localStorage.setItem("memberNameEnglish", data.memberNameEnglish);
            localStorage.setItem("course", data.course);
            window.location.href = "/mainpage";
          } else {
            window.location.href = "/kakaosignup";
          }
        } else {
          throw new Error("필수 로그인 정보가 누락되었습니다.");
        }
      } catch (error) {
        console.error("Login error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          cookies: document.cookie,
        });
        alert(
          "카카오 로그인 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요."
        );
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
