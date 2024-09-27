import { BrowserRouter as Router } from "react-router-dom";
import StartRoutes from "./routes/StartRoutes";
import "./App.css";

function App() {
  return (
    <Router>
      <StartRoutes />
    </Router>
  );
}

export default App;
