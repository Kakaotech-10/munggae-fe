//LoginHandeler.jsx

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
          url: `${import.meta.env.VITE_REACT_APP_REDIRECT_URL}/?code=${code}`,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        });

        console.log(response);
        localStorage.setItem("name", response.data.account.kakaoName);
        navigate("/mainpage");
      } catch (err) {
        console.error("Login error:", err);
        setError("로그인 중 오류가 발생했습니다.");
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
        </div>
      </div>
    );
  }

  return null;
};

export default LoginHandler;
