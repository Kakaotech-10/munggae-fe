import { Routes, Route } from "react-router-dom";
import StudyWriteForm from "../containers/StudyWriteForm";
import StudyViewForm from "../containers/StudyViewForm";
import ProtectedRoute from "./ProtectedRoute";

function StudyRoutes() {
  return (
    <Routes>
      <Route
        path="write"
        element={
          <ProtectedRoute>
            <StudyWriteForm />
          </ProtectedRoute>
        }
      />
      <Route
        path=":postId"
        element={
          <ProtectedRoute>
            <StudyViewForm />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default StudyRoutes;
