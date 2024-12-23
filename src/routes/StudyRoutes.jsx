import { Routes, Route, useLocation } from "react-router-dom";
import StudyWriteForm from "../containers/StudyWriteForm";
import StudyForm from "../containers/StudyForm";
import ProtectedRoute from "./ProtectedRoute";
import StudyViewForm from "../containers/StudyViewForm";

function StudyRoutes() {
  const location = useLocation();
  const isChannelPath = location.pathname.startsWith("/channel");

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
        path={isChannelPath ? "write" : "writepage"}
        element={
          <ProtectedRoute>
            <StudyWriteForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={isChannelPath ? ":postId" : "studyviewpage/:postId"}
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
