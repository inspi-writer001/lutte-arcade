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

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);
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
        console.log("Wallet connected:", address);

        if (address) {
          console.log(address);

          return address;
        }
        // const username = `User_${address?.slice(-4)}`;
        // setUsername(username);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        // setError(error?.toString() || "Couldn't connect wallet");
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
        <div
          className="flex flex-row justify-center h-screen min-h-screen text-white w-full min-w-full"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <div className=" h-full w-[100vw] flex flex-col justify-end relative bottom-9 gap-2">
            <button
              onClick={() => {
                connectWallet();
                if (address) {
                  handleRespawn();
                }
              }}
              className="action_butto hover:cursor-pointer bg-gray-950 py-3 px-12 rounded-md text-center  h-20 w-96 md:w-[400px] max-w-full pirata-one text-5xl self-center"
            >
              Resume Mist
            </button>
            <button
              onClick={() => {
                connectWallet();
                if (address) {
                  handleNavigate("/character-shop");
                }
              }}
              className="action_butto bg-gray-950 py-3 px-12 rounded-md text-center h-20 w-96 md:w-[400px] max-w-full pirata-one text-5xl hover:cursor-pointer self-center"
            >
              Click Here to Start
            </button>
          </div>
        </div>
      ) : (
        <LoadingPage onLoaded={() => setLoaded(true)} />
      )}
    </>
  );
};

export default React.memo(HomePage);
