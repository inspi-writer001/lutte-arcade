// import { shortString } from "starknet";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { sepolia } from "@starknet-react/chains";

import "./App.css";
import HomePage from "./Pages/HomePage";
import SelectCharacter from "./Pages/SelectCharacter";
import Fight from "./Pages/Fight";
import { Connector, StarknetConfig, starkscan } from "@starknet-react/core";
import { RpcProvider } from "starknet";
import ControllerConnector from "@cartridge/connector";
import { CONTRACT_ADDRESS, RPC_URL } from "./constants";
import { useStore } from "./store/GameStore";
import { useEffect } from "react";

export const connector = new ControllerConnector({
  policies: [
    {
      target: CONTRACT_ADDRESS,
      method: "spawn",
      description: "Replenish your health"
    },
    {
      target: CONTRACT_ADDRESS,
      method: "fetch_playable_characters",
      description: "view characters onchain to select from"
    },
    {
      target: CONTRACT_ADDRESS,
      method: "get_user",
      description: "view your character details onchain"
    },
    {
      target: CONTRACT_ADDRESS,
      method: "offensive_phase",
      description: "take your stance and attack thine enemy"
    },
    {
      target: CONTRACT_ADDRESS,
      method: "defensive_phase",
      description: "block enemmy's attack"
    }
  ],
  rpc: RPC_URL,
  theme: "dope-wars",
  colorMode: "dark"
}) as unknown as Connector;

function provider() {
  return new RpcProvider({
    nodeUrl: RPC_URL
  });
}

// function App({ sdk }: { sdk: SDK<LutteSchemaType> }) {

function App() {
  const { setSDK } = useStore();
  useEffect(() => {
    setSDK();
  }, []);
  return (
    <>
      <StarknetConfig
        autoConnect
        chains={[sepolia]}
        connectors={[connector]}
        explorer={starkscan}
        provider={provider}
      >
        <Router>
          <Routes>
            <Route path="/" Component={() => <HomePage />} />

            <Route
              path="/character-shop"
              Component={() => <SelectCharacter />}
            />
            <Route path="/fight" Component={() => <Fight />} />
          </Routes>
        </Router>
      </StarknetConfig>
    </>
  );
}

export default App;
