import { create } from "zustand";
import ControllerConnector from "@cartridge/connector";

const CONTRACT_ADDRESS =
  "0x0548f0a62cf7d5cd0ad5d01e009d309a2bf53bb08e7b59bd696dcb146d4dfdcf";

interface State {
  globalMusic: boolean;
  address: string;
  username: string | null;
  connector: ControllerConnector;
  tokenDetailsOnBASE: any;
  tokenDetailsOnETH: any;
  tokenDetailsOnBSC: any;
  setSearchModal: (address: string) => void;
  toggleglobalMusic: (value: boolean) => void;
  setTokenDetailOnBSC: (details: any) => void;
  setTokenDetailOnBASE: (details: any) => void;
  setTokenDetailOnETH: (details: any) => void;
  connectWallet: () => Promise<void>;
  fetchUsername: () => Promise<void>;
}

const useStore = create<State>((set, get) => ({
  globalMusic: false,
  address: "",
  username: null,
  connector: new ControllerConnector({
    policies: [
      {
        target: CONTRACT_ADDRESS,
        method: "spawn",
        description: "Replenish your health"
      }
    ],
    rpc: "https://api.cartridge.gg/x/starknet/sepolia",
    theme: "dope-wars",
    colorMode: "dark"
  }),
  tokenDetailsOnBASE: "",
  tokenDetailsOnBSC: "",
  tokenDetailsOnETH: "",
  setSearchModal: (address: string) => {
    set(() => ({ address }));
  },
  setTokenDetailOnBASE: (details: any) => {
    set(() => ({ tokenDetailsOnBASE: details }));
  },
  setTokenDetailOnETH: (details: any) => {
    set(() => ({ tokenDetailsOnETH: details }));
  },
  setTokenDetailOnBSC: (details: any) => {
    set(() => ({ tokenDetailsOnBSC: details }));
  },
  toggleglobalMusic: (newValue: boolean) => {
    set(() => ({ globalMusic: newValue }));
  },
  connectWallet: async () => {
    try {
      const { connector } = get();
      const wallet = await connector.connect();
      set({ address: wallet.account });
      console.log("Wallet connected:", wallet.account);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  },
  fetchUsername: async () => {
    try {
      const { connector, address } = get();
      if (!address) {
        console.warn("No address available for username fetch");
        return;
      }
      const username = await connector.username();
      set({ username });
      console.log("Fetched username:", username);
    } catch (error) {
      console.error("Failed to fetch username:", error);
    }
  }
}));

export { useStore };
