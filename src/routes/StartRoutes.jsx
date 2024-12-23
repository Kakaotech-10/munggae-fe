import { Route, Routes } from "react-router-dom";
import StartForm from "../containers/StartForm";
import LoginForm from "../containers/LoginForm";
import SignupForm from "../containers/SignupForm";
import MainForm from "../containers/MainForm";
import SignupForm_kakao from "../containers/SignupForm_kakao";
import KakaoLogin from "../containers/LoginHandler";
import ProtectedRoute from "./ProtectedRoute";
import ChannelRouter from "./ChannelRoutes";

function StartRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StartForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/login/oauth2/callback/kakao" element={<KakaoLogin />} />
      <Route path="/kakaosignup" element={<SignupForm_kakao />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route
        path="/mainpage"
        element={
          <ProtectedRoute>
            <MainForm />
          </ProtectedRoute>
        }
      />

      {/* 채널 라우트와 StudyRoutes를 통합 */}
      <Route
        path="/channel/:channelId/*"
        element={
          <ProtectedRoute>
            <ChannelRouter />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default StartRoutes;
