// LoginHandler.jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { kakaoLogin } from "../api/auth";

const LoginHandler = () => {
  const navigate = useNavigate();
  const code = new URL(window.location.href).searchParams.get("code");

  useEffect(() => {
    const handleKakaoLogin = async () => {
      try {
        if (!code) {
          console.error("인가 코드가 없습니다.");
          navigate("/login");
          return;
        }

        console.log("인가 코드:", code);
        const response = await kakaoLogin(code);
        console.log("응답 데이터:", response);

        // 응답 데이터 구조 확인
        if (!response.data) {
          console.error("응답 데이터가 없습니다.");
          navigate("/login");
          return;
        }

        // 회원가입 필요 여부 확인
        if (!response.data.id) {
          // 사용자 ID가 없으면 신규 사용자로 판단
          const tempData = {
            kakaoId: response.data.kakaoId,
            email: response.data.email,
            nickname: response.data.nickname,
            profileImage: response.data.profileImage,
          };
          console.log("신규 사용자 데이터:", tempData);
          localStorage.setItem("tempUserData", JSON.stringify(tempData));
          navigate("/kakaosignup");
          return;
        }

        // 기존 회원인 경우 토큰 처리
        if (response.data.token) {
          localStorage.setItem("accessToken", response.data.token);
          navigate("/mainpage");
        } else {
          console.error("토큰이 없습니다:", response.data);
          navigate("/login");
        }
      } catch (err) {
        console.error("로그인 에러:", err);
        if (err.response) {
          console.error("서버 응답:", err.response.data);
        }
        navigate("/login");
      }
    };

    handleKakaoLogin();
  }, [code, navigate]);

  return null;
};

export default LoginHandler;
