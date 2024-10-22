import { Routes, Route } from "react-router-dom";
import SettingForm from "../containers/SettingForm";
import ChangePass from "../containers/ChangePass";
// 시작 페이지 라우트
function SettingRoutes() {
  return (
    <Routes>
      <Route path="/setting" element={<SettingForm />} />
      <Route path="/setting/changepassword" element={<ChangePass />} />
    </Routes>
  );
}

export default SettingRoutes;
