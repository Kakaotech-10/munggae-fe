import { Route, Routes } from "react-router-dom";
import StartForm from "../containers/StartForm";
import LoginForm from "../containers/LoginForm";
import SignupForm from "../containers/SignupForm";
import MainForm from "../containers/MainForm";
import SignupForm_kakao from "../containers/SignupForm_kakao";

function StartRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StartForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/kakaosignup" element={<SignupForm_kakao />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/mainpage" element={<MainForm />} />
    </Routes>
  );
}

export default StartRoutes;
