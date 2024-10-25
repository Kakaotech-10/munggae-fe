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
        console.log("Authorization Code:", code); // 인가 코드 확인
        const response = await fetchKakaoData(code);
        console.log("Raw API Response:", response); // 전체 응답 확인
        console.log("Response Data:", response.data); // 응답 데이터 확인
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
    const url = `${import.meta.env.VITE_REACT_APP_SERVER_URL}/oauth2/callback/kakao?code=${code}`;
    console.log("Requesting URL:", url); // API 요청 URL 확인

    return await axios({
      method: "GET",
      url: url,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  };

  const handleLoginResponse = (data) => {
    console.log("=== Login Response Data ===");
    console.log("Full response data:", data);
    console.log("IsExistingUser:", data.isExistingUser);

    if (data.isExistingUser) {
      console.log("=== Existing User Data ===");
      console.log("Member data:", data.member);
      console.log("Token:", data.token);

      localStorage.setItem("member_id", data.member.member_id);
      localStorage.setItem("member_name", data.member.member_name);
      localStorage.setItem(
        "member_name_english",
        data.member.member_name_english
      );
      localStorage.setItem("role", data.member.role);
      localStorage.setItem("course", data.member.course);
      localStorage.setItem("token", data.token);

      if (data.member.profile_image) {
        console.log("Profile image URL:", data.member.profile_image);
        localStorage.setItem("profile_image", data.member.profile_image);
      }

      navigate("/mainpage");
    } else {
      console.log("=== New User Data ===");
      // 카카오에서 받아온 데이터 구조 확인
      console.log("Kakao account data:", data.kakaoAccount || data);

      // 여러 가능한 데이터 구조 확인
      const kakaoData = {
        member_name:
          data.kakaoAccount?.profile?.nickname ||
          data.kakaoAccount?.nickname ||
          data.profile?.nickname ||
          data.nickname ||
          "",
        profile_image:
          data.kakaoAccount?.profile?.profile_image_url ||
          data.kakaoAccount?.profile_image_url ||
          data.profile?.profile_image_url ||
          data.profile_image_url ||
          "",
      };

      console.log("Processed Kakao data to store:", kakaoData);
      localStorage.setItem("tempKakaoData", JSON.stringify(kakaoData));

      // localStorage에 제대로 저장되었는지 확인
      const storedData = localStorage.getItem("tempKakaoData");
      console.log("Data stored in localStorage:", JSON.parse(storedData));

      navigate("/kakaosignup");
    }
  };

  const handleError = (err) => {
    console.error("=== Login Error ===");
    console.error("Error object:", err);
    console.error("Error message:", err.message);
    if (err.response) {
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response.data);
    }

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
