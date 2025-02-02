import { createDojoStore } from "@dojoengine/sdk/state";
import { LutteSchemaType } from "../Helpers/models.gen";

// interface State {
//   globalMusic: boolean;
//   address: string;
//   username: string | null;
//   loading: boolean;
//   error: string | null;
//   toggleglobalMusic: (value: boolean) => void;
//   setLoading: (value: boolean) => void;
//   setAddress: (value: string) => void;
//   setError: (error: string | null) => void;
//   setUsername: (value: string) => void;
//   // sdk: SDK<LutteSchemaType> | undefined;
//   // setSDK: () => void;
// }

// const useStore = create<State>((set) => ({
//   globalMusic: false,
//   address: "",
//   sdk: undefined,
//   username: null,
//   loading: false,
//   error: null,

//   toggleglobalMusic: (newValue: boolean) => {
//     set(() => ({ globalMusic: newValue }));
//   },
//   setLoading: (value) => {
//     set(() => ({ loading: value }));
//   },
//   // setSDK: async () => {
//   //   const sdk = await init<LutteSchemaType>(
//   //     {
//   //       client: {
//   //         rpcUrl: RPC_URL,
//   //         toriiUrl: TORII_URL,
//   //         relayUrl: "/ip4/127.0.0.1/tcp/9090/tcp/80",
//   //         worldAddress: WORLD_ADDRESS
//   //       },
//   //       domain: {
//   //         name: "Lutte Arcade",
//   //         version: "1.0",
//   //         chainId: "1",
//   //         revision: "1"
//   //       }
//   //     },
//   //     schema
//   //   );
//   //   set(() => ({ sdk: sdk }));
//   // },
//   setError: (error) => {
//     set(() => ({ error }));
//   },
//   setAddress: (value: string) => {
//     set(() => ({ address: value }));
//   },
//   setUsername: (value: string) => {
//     set(() => ({ username: value }));
//   }
// }));

const useStore = createDojoStore<LutteSchemaType>();

export { useStore };
