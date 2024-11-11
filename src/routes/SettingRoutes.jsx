import { Routes, Route } from "react-router-dom";
import SettingForm from "../containers/SettingForm";
import ChangePass from "../containers/ChangePass";
import ProtectedRoute from "./ProtectedRoute";

// 시작 페이지 라우트
function SettingRoutes() {
  return (
    <Routes>
      <Route
        path="/setting"
        element={
          <ProtectedRoute>
            <SettingForm />
          </ProtectedRoute>
        }
      />
      <Route path="/setting/changepassword" element={<ChangePass />} />
    </Routes>
  );
}

export default SettingRoutes;
