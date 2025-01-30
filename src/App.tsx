import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import "./App.css";
import HomePage from "./Pages/HomePage";
import SelectCharacter from "./Pages/SelectCharacter";
import Fight from "./Pages/Fight";

import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  voyager,
  Connector,
  cartridgeProvider
} from "@starknet-react/core";

import { ControllerConnector } from "@cartridge/connector";
import { CONTRACT_ADDRESS } from "./constants";
import { useStore } from "./store/GameStore";
import { useEffect } from "react";
import { CallPolicy, SessionPolicies } from "@cartridge/controller";

let policies = [
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
] as CallPolicy[];

// export const cartridgeConnector = new ControllerConnector({
//   policies,
//   url: "",
//   chains: [sepolia]
// });

export const cartridgeConnector = new ControllerConnector({
  rpc: cartridgeProvider().nodeUrl,
  policies
});

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
        chains={[mainnet, sepolia]}
        provider={cartridgeProvider()}
        connectors={[cartridgeConnector as never as Connector]}
        explorer={voyager}
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
