import { Route, Routes } from "react-router-dom";
import StartForm from "../containers/StartForm";
import LoginForm from "../containers/LoginForm";
import SignupForm from "../containers/SignupForm";
import MainForm from "../containers/MainForm";
import SignupForm_kakao from "../containers/SignupForm_kakao";
import NoticeForm from "../containers/NoticeForm";
import Community from "../containers/Community";
import ClubForm from "../containers/ClubForm";

function StartRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StartForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/kakaosignup" element={<SignupForm_kakao />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/mainpage" element={<MainForm />} />
      {<Route path="/noticepage" element={<NoticeForm />} />}
      {<Route path="/communitypage" element={<Community />} />}
      {<Route path="/clubpage" element={<ClubForm />} />}
    </Routes>
  );
}

export default StartRoutes;
