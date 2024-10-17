import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const LoginHandler = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const code = new URL(window.location.href).searchParams.get("code");

  useEffect(() => {
    const kakaoLogin = async () => {
      try {
        const response = await axios({
          method: "GET",
          url: `${import.meta.env.VITE_REACT_APP_REDIRECT_URL}/oauth2/callback/kakao?code=${code}`,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        });

        console.log("Server response:", response.data);

        if (response.data.isExistingUser) {
          // 기존 회원인 경우
          localStorage.setItem("name", response.data.account.nickname);
          localStorage.setItem("token", response.data.token); // 토큰 저장 (있다고 가정)
          navigate("/mainpage");
        } else {
          // 새로운 회원인 경우
          localStorage.setItem("kakaoNickname", response.data.account.nickname);
          if (response.data.account.profileImage) {
            localStorage.setItem(
              "kakaoProfileImage",
              response.data.account.profileImage
            );
          }
          navigate("/kakaosignup");
        }
      } catch (err) {
        console.error("Login error:", err);
        setError(
          err.response?.data?.message || "로그인 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (code) {
      kakaoLogin();
    } else {
      setError("인가 코드를 찾을 수 없습니다.");
      setIsLoading(false);
    }
  }, [code, navigate]);

  if (isLoading) {
    return (
      <div className="LoginHandler">
        <div className="notice">
          <p>로그인 중입니다.</p>
          <p>잠시만 기다려주세요.</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="LoginHandler">
        <div className="notice">
          <p>{error}</p>
          <button onClick={() => navigate("/login")}>
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default LoginHandler;
