import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import "../styles/buttons.css";
import bgImage from "../assets/placeholders/start_bg.svg";
import LoadingPage from "./LoadingPage";
import { useStore } from "../store/GameStore";
import { useAccount, useConnect } from "@starknet-react/core";
import { connector } from "../App";

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  // const [username, setUsername] = useState<string>();
  const { setLoading, setError, setAddress, setUsername } = useStore();
  // const fetchUsername = useStore((state) => state.fetchUsername);
  // const address = useStore((state) => state.address);
  const { connect } = useConnect(); // Hook to connect wallets
  // const username = useStore((state) => state.username);
  const { address } = useAccount(); // Hook to get account address

  const connectWallet = () => {
    setLoading(true);
    setError(null);
    try {
      connect({ connector: connector });

      if (address) {
        setLoading(false);
        setAddress(address);
        console.log("Wallet connected:", address);
      }
    } catch (error) {
      setLoading(false);
      setError(error?.toString() || "couldn't connect");

      console.error("Failed to connect wallet:", error);
    }
  };

  useEffect(() => {
    if (address) {
      try {
        const { address } = useAccount();
        if (!address) {
          console.warn("No address available to fetch username.");
          return;
        }
        const username = `User_${address.slice(-4)}`;
        // set({ username });
        setUsername(username);
        console.log("Fetched username:", username);
      } catch (error) {
        setError(error?.toString() || "couldn't fetch username");

        console.error("Failed to fetch username:", error);
      }
    }
  }, [address]);

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
                connectWallet();
                // .then(() => {
                //   console.log("Address:", address, "Username:", username);
                //   alert(`"Address:", ${address}, "Username:", ${username}`);
                // })
                // .catch((err) => {
                //   alert(`"error:", ${err}`);
                // });

                // navigate("/maps");
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
