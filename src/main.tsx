import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { init } from "@dojoengine/sdk";
import { LutteSchemaType, schema } from "./Helpers/models.gen.ts";
import { RPC_URL, WORLD_ADDRESS } from "./constants.tsx";

const Main = async () => {
  const sdk = await init<LutteSchemaType>(
    {
      client: {
        rpcUrl: RPC_URL,
        toriiUrl: "http://127.0.0.1:8080",
        relayUrl: "your-relay-url",
        worldAddress: WORLD_ADDRESS
      },
      domain: {
        name: "Example",
        version: "1.0",
        chainId: "your-chain-id",
        revision: "1"
      }
    },
    schema
  );

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App sdk={sdk} />
    </StrictMode>
  );
};

Main().catch((error) => {
  console.error("Failed to initialize the application:", error);
});
