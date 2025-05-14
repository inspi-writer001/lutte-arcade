import { useEffect, useState } from "react";
import bgImage from "../assets/select_screen_bg.png";
import header from "../assets/select_screen_header.png";
import "../styles/cards.css";
import { useNavigate } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import { CONTRACT_ADDRESS } from "../constants";
import { ToriiQueryBuilder } from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";
import ch1 from "../assets/placeholders/ch1.png";
import ch3 from "../assets/placeholders/ch3.png";

import IntroScene from "../Components/IntroScene";

const SelectCharacter = () => {
  const { sdk } = useDojoSDK();
  // const { setTransitionTrigger } = useGameStore();

  const [data, setData] = useState<Array<IPlayableCharacter>>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cutScene, setCutScene] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  // let [error, setError] = useState();
  // const [isSuccess, setIsSuccess] = useState(false);
  const { account } = useAccount();

  const navigate = useNavigate();

  //  new ToriiQueryBuilder()
  //    .withClause(
  //      new ClauseBuilder<LutteSchemaType>()
  //        .keys(["lutte-PlayableCharacter"], ["0x1"], "VariableLen")
  //        .build()
  //    )
  //    .build();

  //  new ToriiQueryBuilder()
  //    .withClause(
  //      new ClauseBuilder<LutteSchemaType>()
  //        .where("lutte-PlayableCharacter", "gid", "Eq", 1)
  //        .build()
  //    )
  //    .build();

  useEffect(() => {
    async function fetchToriiClause() {
      const res = await sdk.client.getEntities(
        new ToriiQueryBuilder()
          .withEntityModels(["lutte-PlayableCharacter"])
          .build()
      );
      return res;
    }
    fetchToriiClause().then((result) => {
      console.log(result);
      // console.log(result["0x1"]["lutte-PlayableCharacter"]);

      const array_characters = Object.values(result).map(
        (entry) => entry["lutte-PlayableCharacter"]
      );

      console.log(array_characters);
      setData(array_characters as unknown as Array<IPlayableCharacter>);
      setIsLoading(false);
      console.log(data);
    });
  }, []);

  // let id: PrimitiveField<number>;
  // let address: string;

  const [id, setId] = useState<PrimitiveField<number> | null>(null);
  const [address, setAddress] = useState<string>("");
  useEffect(() => {
    if (introFinished) {
      navigate("/fight", {
        state: { id, address }
      });
    }
  }, [introFinished, navigate]);

  return (
    <div
      className="flex justify-center items-center w-screen h-screen text-center flex-col px-10 bg-[#3b2f2f] overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {cutScene && (
        <div className="cutscene absolute h-full w-full z-50">
          <IntroScene
            onFinish={() => {
              setIntroFinished(true);
            }}
          />
        </div>
      )}
      <div className="__upper_text text-center text-8xl mb-7 unifrakturmaguntia text-red-700 large-stroke absolute top-[5vh]">
        <img src={header} />
      </div>

      <div className="__player_selection w-full flex flex-row justify-center">
        {isLoading ? (
          // Spinner Placeholder
          <div className="spinner">
            <div className="loading"> </div>
          </div>
        ) : (
          // Render Characters
          <div className="__players_tentative w-full flex flex-col md:flex-row justify-center items-center gap-1 relative">
            <img
              src={ch1}
              alt="coming soon left"
              className="pointer-events-none hidden sm:block w-[200px] h-[300px] object-contain"
            />
            <div
              className="__player_boxed grid max-w-[1024px] hover:cursor-pointer overflow-y-scroll p-3"
              style={{
                gridTemplateColumns: "repeat(3, 1fr)", // 3 items per row
                gridAutoRows: "minmax(20rem, auto)", // Ensure rows adapt to content
                overflowY: "scroll", // Enable vertical scrolling
                maxHeight: "80vh", // Set a maximum height for the container
                justifyItems: "center" // Center items in their columns
              }}
            >
              {data &&
                data.map((player, index: number) => {
                  // Determine if this is the last item and adjust its position
                  const isLastItem = index === data.length - 1;
                  const totalItems = data.length;

                  return (
                    <img
                      key={player.uid?.value.toString()} // Use `uid` as a unique key
                      className="__selectable_player player_card flex relative min-w-[200px] min-h-[150px]"
                      src={`${player.folder?.value}${player.skin?.value}`}
                      alt={player.skin?.value}
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
                              calldata: [player.uid.value.toString()]
                            }
                          ])
                          .then((e) => {
                            console.log(e.transaction_hash);
                            console.log("spawn successful");
                            setCutScene(true);

                            setId(player.uid);
                            setAddress(account.address);
                            // setTransitionTrigger(true);
                            // setTimeout(() => {
                            //   navigate("/fight", {
                            //     state: {
                            //       id: player.uid,
                            //       address: account.address
                            //     }
                            //   });
                            // }, 500);
                          })
                          .catch((error) => {
                            console.log("error spawning character");
                            console.log(error);
                          });
                      }}
                    />
                  );
                })}
            </div>
            <img
              src={ch3}
              alt="coming soon right"
              className="pointer-events-none hidden sm:block w-[200px] h-[300px] object-contain"
            />
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
  type_name: "u8" | "u32" | "bool";
}

interface ByteArrayField extends MetadataField<string> {
  type: "bytearray";
  type_name: "ByteArray";
}

// Interface representing the inner value of a UEnemy.
export interface UEnemyValue {
  uid: PrimitiveField<number>;
  health: PrimitiveField<number>;
  attack_power: PrimitiveField<number>;
  special_attack: PrimitiveField<boolean>;
  level: PrimitiveField<number>;
  max_health: PrimitiveField<number>;
  skin: ByteArrayField;
  mugshot: ByteArrayField;
  attack_sprite: ByteArrayField;
  hit_sprite: ByteArrayField;
  idle_sprite: ByteArrayField;
  folder: ByteArrayField;
}

// The wrapper interface that represents a UEnemy in the JSON.
export interface IUEnemy {
  type: "struct";
  type_name: "UEnemy";
  value: UEnemyValue;
  key: boolean;
}

// Interface for the EnemiesList
export interface IEnemiesList {
  "lutte-EnemiesList": {
    enemies: {
      type: "array";
      type_name: "Array<UEnemy>";
      value: IUEnemy[];
      key: boolean;
    };
    id: PrimitiveField<number>;
  };
}

// Interface representing the inner value of a PlayableCharacter.
export interface PlayableCharacterValue {
  uid: PrimitiveField<number>;
  health: PrimitiveField<number>;
  attack_power: PrimitiveField<number>;
  skin: ByteArrayField;
  special_attack: PrimitiveField<boolean>;
  level: PrimitiveField<number>;
  max_health: PrimitiveField<number>;
  mugshot: ByteArrayField;
  attack_sprite: ByteArrayField;
  hit_sprite: ByteArrayField;
  idle_sprite: ByteArrayField;
  folder: ByteArrayField;
}

// The wrapper interface that represents a PlayableCharacter in the JSON.
export type IPlayableCharacter = PlayableCharacterValue;

// Interface for the PlayableCharacterList
export interface IPlayableCharacterList {
  "lutte-PlayableCharacterList": {
    players: {
      type: "array";
      type_name: "Array<PlayableCharacter>";
      value: IPlayableCharacter[];
      key: boolean;
    };
    id: PrimitiveField<number>;
  };
}

// Final interface that combines both lists
export interface ILutteGameData extends IEnemiesList, IPlayableCharacterList {}
