import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const LoginHandler = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    isLoading: true,
    error: null,
  });

  const code = new URL(window.location.href).searchParams.get("code");

  useEffect(() => {
    const kakaoLogin = async () => {
      try {
        const response = await fetchKakaoData(code);
        handleLoginResponse(response.data);
      } catch (err) {
        handleError(err);
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    if (code) {
      kakaoLogin();
    } else {
      handleError(new Error("인가 코드를 찾을 수 없습니다."));
    }
  }, [code, navigate]);

  const fetchKakaoData = async (code) => {
    return await axios({
      method: "GET",
      url: `${import.meta.env.VITE_REACT_APP_SERVER_URL}/oauth2/callback/kakao?code=${code}`,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  };

  const handleLoginResponse = (data) => {
    console.log("Server response:", data);
    if (data.isExistingUser) {
      localStorage.setItem("name", data.account.nickname);
      localStorage.setItem("token", data.token);
      navigate("/mainpage");
    } else {
      localStorage.setItem("kakaoNickname", data.account.nickname);
      if (data.account.profileImage) {
        localStorage.setItem("kakaoProfileImage", data.account.profileImage);
      }
      navigate("/kakaosignup");
    }
  };

  const handleError = (err) => {
    console.error("Login error:", err);
    setState((prev) => ({
      ...prev,
      error:
        err.response?.data?.message ||
        err.message ||
        "로그인 중 오류가 발생했습니다.",
      isLoading: false,
    }));
  };

  if (state.isLoading) {
    return <LoadingView />;
  }

  if (state.error) {
    return <ErrorView error={state.error} onRetry={() => navigate("/login")} />;
  }

  return null;
};

const LoadingView = () => (
  <div className="LoginHandler">
    <div className="notice">
      <p>로그인 중입니다.</p>
      <p>잠시만 기다려주세요.</p>
      <div className="spinner"></div>
    </div>
  </div>
);

const ErrorView = ({ error, onRetry }) => (
  <div className="LoginHandler">
    <div className="notice">
      <p>{error}</p>
      <button onClick={onRetry}>로그인 페이지로 돌아가기</button>
    </div>
  </div>
);

ErrorView.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

export default LoginHandler;
