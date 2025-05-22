import {
  AccountInterface,
  RpcProvider,
  TransactionExecutionStatus
} from "starknet";
import { CONTRACT_ADDRESS } from "../constants";
import { useAccount } from "@starknet-react/core";
import { dojoConfig } from "../dojoConfig";

import { useNavigate } from "react-router-dom";

const provider = new RpcProvider({
  nodeUrl: dojoConfig.rpcUrl as string
});

const WinProceed = () => {
  const { account } = useAccount();

  const id = 1;
  const navigate = useNavigate();

  const nextMist = async (account: AccountInterface | undefined) => {
    if (!account) return;

    try {
      const result = await account.execute([
        {
          contractAddress: CONTRACT_ADDRESS,
          entrypoint: "next_enemy",
          calldata: []
        }
      ]);
      const txHash = result.transaction_hash;

      console.log("Waiting for tx to be accepted: ", txHash);

      await provider.waitForTransaction(txHash, {
        retryInterval: 500,
        successStates: [TransactionExecutionStatus.SUCCEEDED]
        // retryTimeout: 60000 // timeout in ms
      });

      console.log("Transaction accepted!");
      console.log("attempting to respawn");

      // const result_respawn =
      await account.execute([
        {
          contractAddress: CONTRACT_ADDRESS,
          entrypoint: "respawn",
          calldata: []
        }
      ]);
      // const txHashRespawn = result_respawn.transaction_hash;

      // return txHash;
      navigate("/fight", {
        state: { id, address: account.address }
      });
    } catch (error) {
      console.error("Next Stage failed: ", error);

      throw error;
    }
  };
  return (
    <div className="flex flex-col w-full h-full justify-center items-center pirata-one text-center">
      <div className="__text_container unifrakturmaguntia large-stroe text-white text-6xl">
        Victory Secured Champion
      </div>
      <div className="__button_container mt-9">
        <button
          className=" pirata-one font-bold text-4xl hover:cursor-pointer bg-gray-950 py-3 px-12 rounded-md text-center "
          onClick={() => {
            nextMist(account);
          }}
        >
          Proceed to Next Mist
        </button>
      </div>
    </div>
  );
};

export default WinProceed;

interface MetadataField<T> {
  type: string;
  type_name: string;
  value: T;
  key: boolean;
}

// More specific interfaces for known field types (optional)
interface PrimitiveField<T> extends MetadataField<T> {
  type: "primitive";
  type_name: "u8" | "u32" | "bool";
}
