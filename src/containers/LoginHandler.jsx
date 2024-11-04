import { useEffect, useRef } from "react";
import api from "../api/config";
import { useNavigate } from "react-router-dom";

export default function KakaoLogin() {
  const processedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const kakaoLogin = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      try {
        const code = new URL(window.location.href).searchParams.get("code");

        if (!code) {
          console.error("No authorization code found");
          navigate("/login");
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

        // 응답 헤더에서 Set-Cookie 확인
        console.log("Response headers:", response.headers);
        console.log("All cookies:", document.cookie);

        const data = response.data;

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

          // 쿠키 확인
          console.log("Cookies after login:", document.cookie);

          if (data.memberNameEnglish && data.course) {
            localStorage.setItem("memberNameEnglish", data.memberNameEnglish);
            localStorage.setItem("course", data.course);
            navigate("/mainpage");
          } else {
            navigate("/kakaosignup");
          }
        } else {
          throw new Error("필수 로그인 정보가 누락되었습니다.");
        }
      } catch (error) {
        console.error("Login error details:", error);
        alert(
          "카카오 로그인 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요."
        );
        navigate("/login");
      }
    };

    kakaoLogin();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">카카오 로그인 처리중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
