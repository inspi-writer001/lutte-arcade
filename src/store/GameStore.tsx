import { create } from "zustand";
import { createDojoStore, init, SDK } from "@dojoengine/sdk";
import { LutteSchemaType, schema } from "../Helpers/models.gen";
import { RPC_URL, WORLD_ADDRESS } from "../constants";
// import { useStarknet, useAccount, useConnect } from "@starknet-react/core";

interface State {
  globalMusic: boolean;
  address: string;
  username: string | null;
  tokens: {
    BASE: any;
    ETH: any;
    BSC: any;
  };
  loading: boolean;
  error: string | null;
  setSearchModal: (address: string) => void;
  toggleglobalMusic: (value: boolean) => void;
  setTokenDetails: (chain: "BASE" | "ETH" | "BSC", details: any) => void;
  setLoading: (value: boolean) => void;
  setAddress: (value: string) => void;
  setError: (error: string | null) => void;
  setUsername: (value: string) => void;
  sdk: SDK<LutteSchemaType> | undefined;
  setSDK: () => void;
}

const useStore = create<State>((set) => ({
  globalMusic: false,
  address: "",
  sdk: undefined,
  username: null,
  tokens: {
    BASE: "",
    ETH: "",
    BSC: ""
  },
  loading: false,
  error: null,
  setSearchModal: (address: string) => {
    set(() => ({ address }));
  },
  setTokenDetails: (chain, details) => {
    set((state) => ({
      tokens: {
        ...state.tokens,
        [chain]: details
      }
    }));
  },
  toggleglobalMusic: (newValue: boolean) => {
    set(() => ({ globalMusic: newValue }));
  },
  setLoading: (value) => {
    set(() => ({ loading: value }));
  },
  setSDK: async () => {
    const sdk = await init<LutteSchemaType>(
      {
        client: {
          rpcUrl: RPC_URL,
          toriiUrl: "http://127.0.0.1:8080",
          relayUrl: "",
          worldAddress: WORLD_ADDRESS
        },
        domain: {
          name: "Lutte",
          version: "1.0",
          chainId: "1",
          revision: "1"
        }
      },
      schema
    );
    set(() => ({ sdk: sdk }));
  },
  setError: (error) => {
    set(() => ({ error }));
  },
  setAddress: (value: string) => {
    set(() => ({ address: value }));
  },
  setUsername: (value: string) => {
    set(() => ({ username: value }));
  }
}));

const useDojoStore = createDojoStore<LutteSchemaType>();

export { useStore, useDojoStore };
