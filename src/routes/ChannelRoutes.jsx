import { Routes, Route, useParams } from "react-router-dom";
import StudyRoutes from "./StudyRoutes";
import ChannelForm from "../containers/ChannelForm";

function ChannelRouter() {
  const { channelId } = useParams();

  return (
    <Routes>
      <Route index element={<ChannelForm />} />
      <Route
        path="*"
        element={channelId === "5" ? <StudyRoutes /> : <ChannelForm />}
      />
    </Routes>
  );
}

export default ChannelRouter;
