import { Routes, Route } from "react-router-dom";
import StudyWriteForm from "../containers/StudyWriteForm";
import StudyForm from "../containers/StudyForm";
import ProtectedRoute from "./ProtectedRoute";
import StudyViewForm from "../containers/StudyViewForm";

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
      <Route
        path="studyviewpage/:postId"
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
