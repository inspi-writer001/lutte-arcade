import { useNavigate } from "react-router-dom";

import React, { useState } from "react";
import "../styles/buttons.css";
import bgImage from "../assets/placeholders/start_bg.svg";

import { useAccount, useConnect } from "@starknet-react/core";
// import { cartridgeConnector as connector } from "../App";
import LoadingPage from "./LoadingPage";
import { connector } from "../StarknetProvider";

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  const { address } = useAccount(); // Move hook here to avoid invalid hook call error
  const { connect } = useConnect();

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
      } finally {
        // setLoading(false);
        if (address) {
          navigate("/character-shop");
        }
        return address;
      }
    } else {
      navigate("/character-shop");
    }
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
          <div className=" h-full w-[100vw] flex flex-col justify-end relative bottom-0">
            <button
              onClick={() => {
                connectWallet();
                if (address) {
                  navigate("/character-shop");
                }
              }}
              className="action_butto h-20 w-full max-w-full pirata-one text-5xl hover:cursor-pointer"
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
