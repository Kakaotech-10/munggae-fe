import { Route, Routes } from "react-router-dom";
import StartForm from "../containers/StartForm";
import LoginForm from "../containers/LoginForm";
import SignupForm from "../containers/SignupForm";
import MainForm from "../containers/MainForm";
import SignupForm_kakao from "../containers/SignupForm_kakao";
// import NoticeForm from "../containers/NoticeForm";
// import Community from "../containers/Community";
// import ClubForm from "../containers/ClubForm";
import KakaoLogin from "../containers/LoginHandler";
import ProtectedRoute from "./ProtectedRoute";
import StudyRoutes from "./StudyRoutes";
// 채널 컴포넌트 import
import ChannelForm from "../containers/ChannelForm"; // 이 컴포넌트는 생성해야 함

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
      {/* <Route
        path="/noticepage"
        element={
          <ProtectedRoute>
            <NoticeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/communitypage"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clubpage"
        element={
          <ProtectedRoute>
            <ClubForm />
          </ProtectedRoute>
        }
      /> */}
      {/* 채널 라우트 추가 */}
      <Route
        path="/channel/:channelId/*"
        element={
          <ProtectedRoute>
            <ChannelForm />
          </ProtectedRoute>
        }
      />
      <Route path="/studypage/*" element={<StudyRoutes />} />
    </Routes>
  );
}

export default StartRoutes;
