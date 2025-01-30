import { createDojoConfig } from "@dojoengine/core";

import manifest from "./manifest_dev.json";
import { RPC_URL, TORII_URL } from "./constants";

export const dojoConfig = createDojoConfig({
  manifest,
  rpcUrl: RPC_URL,
  toriiUrl: TORII_URL
});
