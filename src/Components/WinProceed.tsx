import {
  AccountInterface,
  RpcProvider,
  TransactionExecutionStatus
} from "starknet";
import { CONTRACT_ADDRESS } from "../constants";
import { useAccount } from "@starknet-react/core";
import { dojoConfig } from "../dojoConfig";

import { useNavigate } from "react-router-dom";
import defeated_first from "/background/defeated_hammer.jpg";
// import defeated_second from "/background/defeated_beast.jpg";
import defeated_third from "/background/defeated_shadow.jpg";
import defeated_fourth from "/background/defeated_skeleton.jpg";
import final_image from "/background/defeated_final.jpg";
import { FC, useEffect, useState } from "react";

const provider = new RpcProvider({
  nodeUrl: dojoConfig.rpcUrl as string
});
interface IEnemIndex {
  enemy_level: number;
}
const WinProceed: FC<IEnemIndex> = ({ enemy_level }) => {
  const { account, address } = useAccount();
  const [showFinal, setShowFinal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const id = 1;
  const navigate = useNavigate();

  useEffect(() => {
    if (enemy_level == 3) {
      const timer = setTimeout(() => {
        setShowFinal(true);
      }, 4000); // 4 seconds

      return () => clearTimeout(timer); // cleanup
    }
  }, []);

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
      const ttxHash = await account.execute([
        {
          contractAddress: CONTRACT_ADDRESS,
          entrypoint: "respawn",
          calldata: []
        }
      ]);
      // const txHashRespawn = result_respawn.transaction_hash;
      navigate("/fight", {
        state: { id, address }
      });
      navigate(0);

      return ttxHash;
    } catch (error) {
      console.error("Next Stage failed: ", error);

      throw error;
    }
  };

  // console.log("enemyy level", enemy_level);
  return (
    <>
      <div
        className="absolute flex flex-col w-screen h-screen justify-center items-center bg-black pirata-one text-center"
        style={{
          background:
            enemy_level == 1
              ? `url(${defeated_first})`
              : enemy_level == 2
              ? `url(${defeated_third})`
              : `url(${defeated_fourth})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center"
        }}
      >
        <div className="__text_container new-rocker large-stroe text-white text-6xl">
          Victory Secured Champion
        </div>
        <div className="__button_container mt-9">
          {enemy_level < 3 && (
            <button
              className=" pirata-one font-bold text-4xl hover:cursor-pointer bg-gray-950 py-3 px-12 rounded-md text-center disabled:bg-gray-500"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                await nextMist(account);
              }}
            >
              {isLoading ? "Loading..." : "Proceed to Next Mist"}
            </button>
          )}
        </div>
      </div>
      {showFinal && (
        <div
          className="final_note fixed h-screen w-screen z-50 bg-black"
          style={{
            backgroundImage: `url(${final_image})`,
            backgroundSize: "",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center"
          }}
        >
          <div className="__button_container absolute z-60 bottom-[10dvh] right-0 left-0 flex justify-center items-center">
            <button
              className=" pirata-one font-bold text-4xl hover:cursor-pointer bg-gray-950 py-3 px-12 rounded-md text-center "
              onClick={() => {
                navigate("/");
              }}
            >
              Get some Rest Champion
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WinProceed;

// interface MetadataField<T> {
//   type: string;
//   type_name: string;
//   value: T;
//   key: boolean;
// }

// More specific interfaces for known field types (optional)
// interface PrimitiveField<T> extends MetadataField<T> {
//   type: "primitive";
//   type_name: "u8" | "u32" | "bool";
// }
