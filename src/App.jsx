import { BrowserRouter as Router } from "react-router-dom";
import StartRoutes from "./routes/StartRoutes";
import SettingRoutes from "./routes/SettingRoutes";
import "./api/interceptors";
import "./App.css";

function App() {
  return (
    <Router>
      <div>
        <StartRoutes />
        <SettingRoutes />
      </div>
    </Router>
  );
}

export default App;
