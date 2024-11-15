import { useNavigate } from "react-router-dom";
import "../styles/buttons.css";
import bgImage from "../assets/placeholders/start_bg.svg";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-row justify-center h-screen min-h-screen text-white w-[100vw] min-w-[100vw]"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className=" h-full w-full max-w-[1024px] flex flex-col items-center gap-4 justify-center">
        <button onClick={() => navigate("/battle")} className="action_button">
          Quick Battle
        </button>
        <button
          onClick={() => navigate("/character-shop")}
          className="action_button"
        >
          Select Character
        </button>
        <button onClick={() => navigate("/settings")} className="action_button">
          Settings
        </button>
      </div>
    </div>
  );
};

export default HomePage;
