import { Route, Routes } from "react-router-dom";
import StartForm from "../containers/StartForm";
import LoginForm from "../containers/LoginForm";
import SignupForm from "../containers/SignupForm";
import MainForm from "../containers/MainForm";
import SignupForm_kakao from "../containers/SignupForm_kakao";
import NoticeForm from "../containers/NoticeForm";
import Community from "../containers/Community";
import ClubForm from "../containers/ClubForm";
import KakaoLogin from "../containers/LoginHandler";
import ProtectedRoute from "./ProtectedRoute";

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
      <Route
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
      />
    </Routes>
  );
}

export default StartRoutes;
