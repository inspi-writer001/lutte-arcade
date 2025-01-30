import type { PropsWithChildren } from "react";
import { sepolia } from "@starknet-react/chains";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { dojoConfig } from "./dojoConfig";
import { ControllerConnector } from "@cartridge/connector";

import { CONTRACT_ADDRESS } from "./constants";
import { SessionPolicies } from "@cartridge/controller";
import { constants } from "starknet";

// let pa = new ControllerConnector({
//   chains: [sepolia]
// }) as Connector;

// let pa: PredeployedAccountsConnector[] = [];
// predeployedAccounts({
//   rpc: dojoConfig.rpcUrl as string,
//   id: "0x534e5f5345504f4c4941",
//   name: "sepolia"
// }).then((p) => (pa = p));

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
  }
};
const sepoliaWithRpc = {
  ...sepolia,
  rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia"
};

export const connector = new ControllerConnector({
  policies,
  chains: [sepoliaWithRpc],
  defaultChainId: constants.StarknetChainId.SN_SEPOLIA
});

export default function StarknetProvider({ children }: PropsWithChildren) {
  const provider = jsonRpcProvider({
    rpc: () => ({ nodeUrl: dojoConfig.rpcUrl as string })
  });

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={provider}
      connectors={[connector]}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
