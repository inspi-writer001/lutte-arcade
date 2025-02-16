import { useEffect, useState } from "react";
import bgImage from "../assets/placeholders/start_plain.svg";
// import { useContractInstance } from "../hooks/useContract";
import "../styles/cards.css";
// import { useStore } from "../store/GameStore";
import { useNavigate } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import { CONTRACT_ADDRESS } from "../constants";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";

import { SchemaType as LutteSchemaType } from "../Helpers/models.gen";
import { useGameStore } from "../store/GameStore";

const SelectCharacter = () => {
  const { sdk } = useDojoSDK();
  const { setTransitionTrigger } = useGameStore();

  const [data, setData] = useState<Array<IPlayableCharacter>>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // let [error, setError] = useState();
  // const [isSuccess, setIsSuccess] = useState(false);
  const { account } = useAccount();

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchToriiClause() {
      const res = await sdk.client.getEntities(
        new ToriiQueryBuilder()
          .withClause(
            new ClauseBuilder<LutteSchemaType>()
              .keys(["lutte-PlayableCharacterList"], ["0x0"], "VariableLen")
              .build()
          )
          .withLimit(2)
          .build()
      );
      return res;
    }
    fetchToriiClause().then((result) => {
      console.log(result);
      console.log(result["0x0"]["lutte-PlayableCharacterList"]?.players.value);
      setData(
        result["0x0"]["lutte-PlayableCharacterList"]?.players
          .value as unknown as Array<IPlayableCharacter>
      );
      setIsLoading(false);
      console.log(data);
    });
  }, []);

  return (
    <div
      className="flex justify-center items-center w-screen h-screen text-center flex-col px-10 bg-[#3b2f2f]"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="__upper_text text-center text-8xl mb-7 unifrakturmaguntia text-red-700 large-stroke">
        Choose Your Warrior
      </div>

      <div className="__player_selection w-full flex flex-row justify-center">
        {isLoading ? (
          // Spinner Placeholder
          <div className="spinner">
            <div className="loading"> </div>
          </div>
        ) : (
          // Render Characters
          <div
            className="__player_boxed grid gap-4 max-w-[1024px] hover:cursor-pointer overflow-y-scroll p-3"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)", // 3 items per row
              gridAutoRows: "minmax(20rem, auto)", // Ensure rows adapt to content
              overflowY: "scroll", // Enable vertical scrolling
              maxHeight: "80vh", // Set a maximum height for the container
              justifyItems: "center" // Center items in their columns
            }}
          >
            {/* {!data && (
              <div
                onClick={() => {
                  console.log(data);
                }}
              >
                press
              </div>
            )} */}
            {data &&
              data.map((player, index: number) => {
                // Determine if this is the last item and adjust its position
                const isLastItem = index === data.length - 1;
                const totalItems = data.length;

                return (
                  <div
                    key={player.value.uid.value.toString()} // Use `uid` as a unique key
                    className="__selectable_player player_card flex relative bg-blue-400 border-black border-4 min-w-72 min-h-72"
                    style={{
                      gridColumn:
                        isLastItem && totalItems % 3 !== 0
                          ? "2 / span 1"
                          : "auto", // Center the last item if it's alone in the row
                      borderRadius: "0.5rem",
                      overflow: "hidden", // Ensures the image is cropped
                      position: "relative"
                    }}
                    onClick={() => {
                      account
                        ?.execute([
                          {
                            contractAddress: CONTRACT_ADDRESS,
                            entrypoint: "spawn",
                            calldata: [player.value.uid.value.toString()]
                          }
                        ])
                        .then((e) => {
                          console.log(e.transaction_hash);
                          console.log("spawn successful");

                          setTransitionTrigger(true);
                          setTimeout(() => {
                            navigate("/fight", {
                              state: {
                                id: player.value.uid,
                                address: account.address,
                                // characterImage: `https://bronze-petite-viper-118.mypinata.cloud/ipfs/${player.value.skin.value}`,
                                characterImage: `${player.value.skin.value}`,
                                enemyImage: `https://bronze-petite-viper-118.mypinata.cloud/ipfs/${data[0].value.skin.value}`
                              }
                            });
                          }, 500);
                        })
                        .catch((error) => {
                          console.log("error spawning character");
                          console.log(error);
                        });
                    }}
                  >
                    <img
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      style={{
                        objectPosition: "center top",
                        transform: "scale(2.5)", // Optional zoom effect
                        marginTop: "10rem" // Adjust to center the desired portion
                      }}
                      // src={`https://bronze-petite-viper-118.mypinata.cloud/ipfs/${player.value.skin.value}`}
                      src={`${player.value.skin.value}`}
                      alt={player.value.skin.value}
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectCharacter;

interface MetadataField<T> {
  type: string;
  type_name: string;
  value: T;
  key: boolean;
}

// More specific interfaces for known field types (optional)
interface PrimitiveField<T> extends MetadataField<T> {
  type: "primitive";
  // We list the expected type names here, adjust as needed.
  type_name: "u8" | "u32" | "bool";
}

interface ByteArrayField extends MetadataField<string> {
  type: "bytearray";
  type_name: "ByteArray";
}

// Interface representing the inner value of a PlayableCharacter.
export interface PlayableCharacterValue {
  uid: PrimitiveField<number>;
  health: PrimitiveField<number>;
  attack_power: PrimitiveField<number>;
  skin: ByteArrayField;
  special_attack: PrimitiveField<boolean>;
  level: PrimitiveField<number>;
}

// The wrapper interface that represents a PlayableCharacter in the JSON.
export interface IPlayableCharacter {
  type: "struct";
  type_name: "PlayableCharacter";
  value: PlayableCharacterValue;
  key: boolean;
}
