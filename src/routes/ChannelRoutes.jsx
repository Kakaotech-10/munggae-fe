import { useParams } from "react-router-dom";
import StudyRoutes from "./StudyRoutes";
import ChannelForm from "../containers/ChannelForm";

function ChannelRouter() {
  const { channelId } = useParams();

  // channelId가 5인 경우 StudyRoutes를 사용
  if (channelId === "5") {
    return <StudyRoutes />;
  }

  // 다른 channelId의 경우 ChannelForm을 사용
  return <ChannelForm />;
}

export default ChannelRouter;
