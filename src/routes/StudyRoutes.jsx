import { Routes, Route } from "react-router-dom";
import StudyWriteForm from "../containers/StudyWriteForm";
import StudyForm from "../containers/StudyForm";
import ProtectedRoute from "./ProtectedRoute";

function StudyRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <ProtectedRoute>
            <StudyForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="writepage"
        element={
          <ProtectedRoute>
            <StudyWriteForm />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default StudyRoutes;
