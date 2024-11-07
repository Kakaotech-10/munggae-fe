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

        // 카카오 로그인 요청
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

        const data = response.data;

        // 기본 정보 저장
        if (data.token?.accessToken) {
          localStorage.setItem("accessToken", data.token.accessToken);
          api.defaults.headers.common["Authorization"] =
            `Bearer ${data.token.accessToken}`;
        }

        if (data.kakaoId) {
          localStorage.setItem("kakaoId", data.kakaoId.toString());
        }

        if (data.memberId) {
          localStorage.setItem("userId", data.memberId.toString());
        }

        if (data.nickname) {
          localStorage.setItem("nickname", data.nickname);
        }

        // memberJoin이 true면 신규 회원
        if (data.memberJoin) {
          // 신규 회원은 추가 정보 입력 페이지로 이동
          navigate("/kakaosignup");
        } else {
          // 기존 회원의 경우 필요한 추가 정보를 가져오기 위한 API 호출
          try {
            const memberResponse = await api.get(
              `/api/v1/members/${data.memberId}`
            );
            const memberData = memberResponse.data;

            // 회원 정보 저장
            localStorage.setItem(
              "memberInfo",
              JSON.stringify({
                id: memberData.id,
                role: memberData.role,
                course: memberData.course,
                name: memberData.name,
                nameEnglish: memberData.nameEnglish,
              })
            );

            if (memberData.name) {
              localStorage.setItem("memberName", memberData.name);
            }

            if (memberData.nameEnglish) {
              localStorage.setItem("memberNameEnglish", memberData.nameEnglish);
            }

            if (memberData.course) {
              localStorage.setItem("course", memberData.course);
            }

            // 메인 페이지로 이동
            navigate("/mainpage");
          } catch (error) {
            console.error("Error fetching member details:", error);
            alert("회원 정보를 불러오는데 실패했습니다.");
            navigate("/login");
          }
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
