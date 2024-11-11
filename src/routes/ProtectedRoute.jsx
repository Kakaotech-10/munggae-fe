// ProtectedRoute.js
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const checkAuthStatus = () => {
  const accessToken = localStorage.getItem("accessToken");
  const memberInfo = localStorage.getItem("memberInfo");

  try {
    if (accessToken && memberInfo) {
      const parsedMemberInfo = JSON.parse(memberInfo);
      return parsedMemberInfo && parsedMemberInfo.id ? true : false;
    }
  } catch (e) {
    console.error("Failed to parse memberInfo:", e);
    localStorage.removeItem("memberInfo");
    localStorage.removeItem("accessToken");
  }

  return false;
};

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();

  if (!isAuthenticated) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉션
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
