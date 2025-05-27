import { useNavigate } from "react-router-dom";

import React, { useState } from "react";
import "../styles/buttons.css";
import bgImage from "../assets/placeholders/start_bg.svg";

import { useAccount, useConnect } from "@starknet-react/core";
// import { cartridgeConnector as connector } from "../App";
import LoadingPage from "./LoadingPage";
import { connector } from "../StarknetProvider";
import { useGameStore } from "../store/GameStore";

import { CONTRACT_ADDRESS } from "../constants";
import start_button from "/button/play_button.png";
import continue_button from "/button/continue_button.png";
import IntroScene from "../Components/IntroScene";

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const navigate = useNavigate();

  const { address, account } = useAccount(); // Move hook here to avoid invalid hook call error
  const { connect } = useConnect();
  const { setTransitionTrigger } = useGameStore();

  const handleNavigate = (path: string) => {
    // Trigger the overlay
    setTransitionTrigger(true);
    // After the transition, navigate to the new page
    setTimeout(() => {
      navigate(path);
    }, 500); // should match or be slightly less than the overlay transition
  };

  // setSDK(sdk);

  // Connect Wallet Function
  const connectWallet = () => {
    if (!address) {
      try {
        connect({ connector });

        if (address) {
          return address;
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  const handleRespawn = async () => {
    if (!account) return;

    await account.execute([
      {
        contractAddress: CONTRACT_ADDRESS,
        entrypoint: "respawn",
        calldata: []
      }
    ]);

    navigate("/fight", {
      state: { id: 1, address }
    });
  };

  return (
    <>
      {loaded ? (
        <>
          {showIntro && (
            <div className="cutscene fixed h-screen w-screen z-50 self-center flex">
              <IntroScene
                onFinish={() => {
                  handleNavigate("/character-shop");
                }}
              />
            </div>
          )}
          <div
            className="flex flex-row justify-center h-screen min-h-screen text-white w-full min-w-full"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
            <div className=" h-full w-[100vw] flex flex-col justify-end relative bottom-9 gap-1">
              {
                <button
                  onClick={() => {
                    connectWallet();
                    if (address) {
                      handleRespawn();
                    }
                  }}
                  className="action_butto rounded-md text-center w-96 md:w-[250px] max-w-full pirata-one text-5xl hover:cursor-pointer self-center -mb-15"
                >
                  <img src={continue_button} alt="" className="resume_btn" />
                </button>
              }
              <button
                onClick={() => {
                  connectWallet();
                  if (address) {
                    setShowIntro(true);
                  }
                }}
                className="action_butto rounded-md text-center w-96 md:w-[250px] max-w-full pirata-one text-5xl hover:cursor-pointer self-center "
              >
                <img src={start_button} alt="" className="start_btn" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <LoadingPage onLoaded={() => setLoaded(true)} />
      )}
    </>
  );
};

export default React.memo(HomePage);
