import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create root and render App
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
