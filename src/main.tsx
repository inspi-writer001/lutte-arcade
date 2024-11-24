import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const Main = async () => {
  // useEffect(() => {
  //   if (!sdk) {
  //     setSDK();
  //   } else {
  //     console.log("failed to initialize app");
  //     return;
  //   }
  // }, []);
  // await
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

Main().catch((error) => {
  console.error("Failed to initialize the application:", error);
});
