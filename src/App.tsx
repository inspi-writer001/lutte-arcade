// @ts-nocheck

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import "./App.css";
import HomePage from "./Pages/HomePage";
import SelectCharacter from "./Pages/SelectCharacter";
// import Fight from "./Pages/Fight";
// import Fight from "./Pages/FightCanvas.tsx";
import Fight from "./Pages/Fighter";

import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import {
  jsonRpcProvider,
  StarknetConfig,
  starkscan
} from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { SessionPolicies } from "@cartridge/controller";

const rpc = "https://api.cartridge.gg/x/starknet/sepolia";

import { CONTRACT_ADDRESS } from "./constants";
import StarknetProvider from "./StarknetProvider";
import TransitionOverlay from "./Components/TransitionOverlay";
import { useGameStore } from "./store/GameStore";
import PixiBunny from "./Pages/PixiBunny";
import BackgroundMusic from "./Components/BackgroundMusic";
import { useRef } from "react";

const policies: SessionPolicies = {
  contracts: {
    [CONTRACT_ADDRESS]: {
      methods: [
        {
          entrypoint: "spawn",
          description: "Replenish your health",
          name: "spawn"
        },

        {
          name: "offensive_phase",
          entrypoint: "offensive_phase",
          description: "take your stance and attack thine enemy"
        },
        {
          name: "defensive_phase",
          entrypoint: "defensive_phase",
          description: "block enemmy's attack"
        }
      ]
    }
  },
  messages: [
    {
      types: {
        StarknetDomain: [
          { name: "name", type: "shortstring" },
          { name: "version", type: "shortstring" },
          { name: "chainId", type: "shortstring" },
          { name: "revision", type: "shortstring" }
        ],
        Person: [
          { name: "name", type: "felt" },
          { name: "wallet", type: "felt" }
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "felt" }
        ]
      },
      primaryType: "Mail",
      domain: {
        name: "StarkNet Mail",
        version: "1",
        revision: "1",
        chainId: "SN_SEPOLIA"
      }
    }
  ]
};

// Configure RPC provider
const provider = new jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
      case sepolia:
      default:
        return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
    }
  }
});

function App() {
  const { transitionTrigger, setTransitionTrigger, setGlobalMusic } =
    useGameStore();
  const bgMusicRef = useRef<any>(null);
  // setGlobalMusic(true);
  return (
    <div className="aspect-wrapper relative">
      <StarknetProvider>
        <BackgroundMusic ref={bgMusicRef} />
        <Router>
          <Routes>
            <Route path="/" Component={() => <HomePage />} />

            <Route path="/bunny" Component={() => <PixiBunny />} />

            <Route
              path="/character-shop"
              Component={() => <SelectCharacter />}
            />
            <Route path="/fight" Component={() => <Fight />} />
          </Routes>
        </Router>
        <TransitionOverlay />
      </StarknetProvider>
    </div>
  );
}

// @ts-ignore
// const controller = new ControllerConnector({
//   policies,
//   rpc,
//   url: "https://lutte-arcade.vercel.app",
//   profileUrl: "https://lutte-arcade.vercel.app",
//   slot: "lutte-arcade",
//   preset: "eternum",
//   namespace: "lutte",
//   // defaultChainId: "0x534e5f5345504f4c4941",
//   chains: [sepolia]
// });

export default App;
