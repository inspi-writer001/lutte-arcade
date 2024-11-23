import { create } from "zustand";
import { createDojoStore } from "@dojoengine/sdk";
import { LutteSchemaType } from "../Helpers/models.gen";
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
  sdk: any;
  setSDK: (initSDK: any) => void;
}

const useStore = create<State>((set) => ({
  globalMusic: false,
  address: "",
  sdk: "",
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
  setSDK: (value) => {
    set(() => ({ sdk: value }));
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
