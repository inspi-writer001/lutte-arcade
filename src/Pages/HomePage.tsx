import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import "../styles/buttons.css";
import bgImage from "../assets/placeholders/start_bg.svg";
import LoadingPage from "./LoadingPage";
import { useStore } from "../store/GameStore";

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  // const { connect, connectors } = useConnect();
  // // const { disconnect } = useDisconnect();
  // // const { address } = useAccount();

  // const connector = connectors[0] as unknown as ControllerConnector;

  // const [username, setUsername] = useState<string>();
  const connectWallet = useStore((state) => state.connectWallet);
  const fetchUsername = useStore((state) => state.fetchUsername);
  const address = useStore((state) => state.address);
  const username = useStore((state) => state.username);

  useEffect(() => {
    if (address) {
      fetchUsername();
    }
  }, [address, fetchUsername]);

  return (
    <>
      {loaded ? (
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
            <button
              onClick={async () => {
                await connectWallet();
                console.log("Address:", address, "Username:", username);
                // navigate("/battle")
              }}
              className="action_button"
            >
              Quick Battle
            </button>
            <button
              onClick={() => navigate("/character-shop")}
              className="action_button"
            >
              Select Character
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="action_button"
            >
              Settings
            </button>
          </div>
        </div>
      ) : (
        <LoadingPage onLoaded={() => setLoaded(true)} />
      )}{" "}
    </>
  );
};

export default HomePage;
