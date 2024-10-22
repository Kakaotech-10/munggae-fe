import { BrowserRouter as Router } from "react-router-dom";
import StartRoutes from "./routes/StartRoutes";
import SettingRoutes from "./routes/SettingRoutes";
import "./App.css";

function App() {
  return (
    <Router>
      <StartRoutes />
      <SettingRoutes />
    </Router>
  );
}

export default App;
