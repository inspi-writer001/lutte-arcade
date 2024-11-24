import { useNavigate } from "react-router-dom";

import React, { useState } from "react";
import "../styles/buttons.css";
import bgImage from "../assets/placeholders/start_bg.svg";
import LoadingPage from "./LoadingPage";
import { useStore } from "../store/GameStore";
import { useAccount, useConnect } from "@starknet-react/core";
import { connector } from "../App";

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  const { address } = useAccount(); // Move hook here to avoid invalid hook call error
  const { connect } = useConnect();
  const { setLoading, setError, setAddress } = useStore();

  // setSDK(sdk);

  // Connect Wallet Function
  const connectWallet = () => {
    if (!address) {
      setLoading(true);
      setError(null);

      try {
        connect({ connector });
        console.log("Wallet connected:", address);
        setAddress(address || "");
        // const username = `User_${address?.slice(-4)}`;
        // setUsername(username);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setError(error?.toString() || "Couldn't connect wallet");
      } finally {
        setLoading(false);
      }
    }
    console.log(address);
  };

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
            <button onClick={connectWallet} className="action_button">
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

export default React.memo(HomePage);
