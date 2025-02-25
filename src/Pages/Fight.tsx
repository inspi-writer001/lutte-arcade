import { useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import fight_bg from "../assets/placeholders/fight_bg.png";
import component_wrapper from "../assets/bottom_components/bottom_ui.png";
import turn_wrapper from "../assets/bottom_components/endturn.png";
import { createRef, useEffect, useState } from "react";
import { SchemaType as LutteSchemaType } from "../Helpers/models.gen";
import { AccountInterface } from "starknet";
import { CONTRACT_ADDRESS } from "../constants";
import HealthBar from "../Components/Healthbar";
import Spritesheet from "react-responsive-spritesheet";
import "../styles/fonts.css";

import {
  red_buttons,
  blue_buttons,
  green_buttons,
  other_buttons
} from "../Components/Buttons";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";

let depressed = 0; // 0-5
let neutral = 6; // 6-15
let motivated = 16; // 16-20

// last attack state can be 0, 1, 2, 3, 4 -- 1- successful attack, 2- glazed attack, 3- missed
// attack, 4- critical attack, 0- not yet attacked

const Fight = () => {
  async function fetchUser(address: string) {
    console.log("address: ", address);
    const res = await sdk.client.getEntities(
      new ToriiQueryBuilder()
        .withClause(
          new ClauseBuilder<LutteSchemaType>()
            .keys(["lutte-Player"], [address], "VariableLen")
            .build()
        )
        .withLimit(1)
        .build()
    );
    console.log(res);
    return res;
  }
  const { account } = useAccount();
  const { state } = useLocation();
  const { sdk } = useDojoSDK();
  const PlayerAnimation = createRef<Spritesheet>();
  const EnemyAnimation = createRef<Spritesheet>();

  const navigate = useNavigate();
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const [playerDetails, setPlayerDetails] = useState<LuttePlayer>();
  const [_fightTxHash, setFightTxHash] = useState<string>();
  const [isPlayerAttacking, setIsPlayerAttacking] = useState<boolean>(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState<boolean>(false);
  const [movePlayer, setMovePlayer] = useState(false);
  const [_selectedButtonID, setSelectedButtonID] = useState<number>();
  const [_demeanor, _setDemeanor] = useState<
    typeof motivated | typeof neutral | typeof motivated
  >(depressed);

  if (!state?.address) return navigate("/");

  useEffect(() => {
    fetchUser(state.address).then((response) => {
      console.log("account user");
      console.log(response);
      setPlayerDetails(
        response["0x0"]["lutte-Player"] as unknown as LuttePlayer
      );
      setIsPlayerLoading(false);
    });
  }, []);

  const [playerTurn, setPlayerTurn] = useState(
    playerDetails?.last_attack.value
  );

  const fightAction = async (
    account: AccountInterface | undefined,
    id: number
  ): Promise<string | undefined> => {
    // setIsPlayerAttacking(true);
    setSelectedButtonID(id);
    // PlayerAnimation.current?.goToAndPlay(1);
    if (account)
      return account
        ?.execute([
          {
            contractAddress: CONTRACT_ADDRESS,
            entrypoint: "offensive_phase",
            calldata: [id]
          }
        ])
        .then(async (e) => {
          console.log(e);

          console.log(e.transaction_hash);

          console.log("fight successful");
          // setIsPlayerAttacking(false);
          fetchUser(state.address).then((response) => {
            console.log("account user");
            console.log(response);
            setPlayerDetails(
              response["0x0"]["lutte-Player"] as unknown as LuttePlayer
            );
          });
          setPlayerTurn(false);
          return e.transaction_hash;
        })
        .catch((error) => {
          console.log("error atttacking character");
          setIsPlayerAttacking(false);
          console.log(error);
          throw error;
        });
  };

  const resolveAction = async (
    account: AccountInterface | undefined
  ): Promise<string | undefined> => {
    setIsPlayerAttacking(true);
    if (account)
      return account
        ?.execute([
          {
            contractAddress: CONTRACT_ADDRESS,
            entrypoint: "defensive_phase",
            calldata: []
          }
        ])
        .then((e) => {
          console.log(e.transaction_hash);
          console.log("defebnse successful");
          setIsPlayerAttacking(false);
          setMovePlayer(false);

          fetchUser(state.address).then((response) => {
            console.log("account user");
            console.log(response);
            setPlayerDetails(
              response["0x0"]["lutte-Player"] as unknown as LuttePlayer
            );
            setIsPlayerLoading(false);
          });
          setPlayerTurn(true);

          setTimeout(() => {
            defendAction(account);
          }, 200);
          return e.transaction_hash;
        })
        .catch((error) => {
          console.log("error defending character");
          console.log(error);
          throw error;
        });
  };

  const defendAction = async (
    account: AccountInterface | undefined
  ): Promise<string | undefined> => {
    setIsEnemyAttacking(true);
    if (account)
      return account
        ?.execute([
          {
            contractAddress: CONTRACT_ADDRESS,
            entrypoint: "defensive_phase",
            calldata: []
          }
        ])
        .then((e) => {
          console.log(e.transaction_hash);
          console.log("defebnse successful");
          setIsEnemyAttacking(false);

          fetchUser(state.address).then((response) => {
            console.log("account user");
            console.log(response);
            setPlayerDetails(
              response["0x0"]["lutte-Player"] as unknown as LuttePlayer
            );
            setIsPlayerLoading(false);
          });
          setPlayerTurn(true);
          return e.transaction_hash;
        })
        .catch((error) => {
          console.log("error defending character");
          console.log(error);
          throw error;
        });
  };

  // console.log(state);
  // const playable_character = state as IplayableCharacter;

  if (!playerDetails?.last_attack) return;

  return (
    <div className="flex justify-center items-center w-screen max-h-screen text-center flex-col bg-[#3b2f2f]">
      <div
        className="flex h-[83vh] w-full relative justify-center"
        style={{
          backgroundImage: `url(${fight_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="__fight_canvas w-full h-full max-h-[83vh] flex flex-col justify-between px-1 md:px-20 relative max-w-[1500px] overflow-hidden">
          <div className="__health flex flex-row justify-between w-full">
            <div className="__character_health flex self-start min-w-[30%] flex-col mt-6 items-start">
              <HealthBar
                percentage={((playerDetails?.health.value || 0) / 200) * 100}
              />
              {/* <p>
                Health: {isPlayerLoading ? "Loading..." : playerDetails?.health}
              </p> */}
              <p>
                Demeanor:{" "}
                {isPlayerLoading ? "Loading..." : playerDetails?.demeanor.value}
              </p>
            </div>
            <div className="__character_health flex self-start min-w-[30%] flex-col mt-6 items-end">
              <div className="__flipped_appearance transform scale-x-[-1]">
                <HealthBar
                  percentage={
                    ((playerDetails?.current_enemy.value.health.value || 0) /
                      200) *
                    100
                  }
                />
              </div>
              {/* <p>
                Health:{" "}
                {isPlayerLoading
                  ? "Loading..."
                  : playerDetails?.current_enemy.health}
              </p> */}
              <p>
                Attack Power:{" "}
                {isPlayerLoading
                  ? "Loading..."
                  : playerDetails?.current_enemy.value.attack_power.value}
              </p>
            </div>
          </div>

          {/* Ensure the characters' container does not overflow */}
          {/* h-[calc(100%-120px)] */}
          <div className="__characters flex w-full justify-between relative group">
            {/* LEFT CHARACTER */}
            <div
              className={`
      __left_character
      aspect-[1200/734]         /* 1200×734 ratio for the sprite */
      w-[47vw]               
      flex items-center justify-center
      relative self-end
      transition-transform duration-500
      overflow-hidden
      ${movePlayer ? "translate-x-[80%] z-20" : "translate-x-0 z-10"}
    `}
            >
              <Spritesheet
                key={isPlayerAttacking ? "attack" : "idle"}
                ref={PlayerAnimation}
                image={
                  isPlayerAttacking
                    ? playerDetails?.character.value.folder.value +
                      playerDetails?.character.value.attack_sprite.value
                    : playerDetails?.character.value.folder.value +
                      playerDetails?.character.value.idle_sprite.value
                }
                widthFrame={1200}
                heightFrame={734}
                steps={isPlayerAttacking ? 5 : 6}
                fps={isPlayerAttacking ? 10 : 5}
                autoplay
                loop={!isPlayerAttacking}
                direction="forward"
                /* Let Tailwind handle object-fit / sizing */
                style={{
                  height: "120%",
                  width: "120%",
                  objectFit: "contain"
                }}
              />
            </div>

            {/* RIGHT CHARACTER */}
            <div
              className={`
      __right_character
      aspect-[1333/750]         /* 1333×750 ratio for the enemy sprite */
      w-[47vw]    
      flex items-center justify-center
      relative self-end transition-transform duration-500
      overflow-hidden
      ${isPlayerAttacking ? "z-10" : "z-20"} ${
                isEnemyAttacking ? "-translate-x-[45vw]" : "translate-x-0 z-10"
              }
    `}
            >
              <Spritesheet
                key={isEnemyAttacking ? "Eattack" : "Eidle"}
                ref={EnemyAnimation}
                image={
                  isEnemyAttacking
                    ? ((playerDetails?.current_enemy.value.folder.value +
                        playerDetails?.current_enemy.value.attack_sprite
                          .value) as string)
                    : ((playerDetails?.current_enemy.value.folder.value +
                        playerDetails?.current_enemy.value.idle_sprite
                          .value) as string)
                }
                widthFrame={1333}
                heightFrame={750}
                steps={isEnemyAttacking ? 5 : 6}
                fps={isEnemyAttacking ? 10 : 5}
                autoplay
                loop
                direction="forward"
                style={{
                  display: "grid",
                  height: "120%",
                  width: "120%",
                  objectFit: "contain"
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="__bottom_tab bg-black h-[17vh] w-full relative bottom-0 flex flex-row justify-between px-10">
        <div
          className="__actions_buttons flex w-[450px] relative flex-row items-center"
          style={{
            backgroundImage: `url(${component_wrapper})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",

            visibility: playerTurn ? "visible" : "hidden"
          }}
        >
          <div className="__character_headshot h-20  w-36 flex flex-row">
            <img
              src={
                playerDetails.character.value.folder.value +
                playerDetails.character.value.mugshot.value
              }
              alt="profilee picture"
              className="h-20 ml-2 p-1 pirata-one"
            />
            <div className="__excitement text-amber-300 self-end mb-1 unifrakturmaguntia">
              {playerDetails?.demeanor?.value != null &&
                (playerDetails?.demeanor.value > neutral
                  ? "Motivated"
                  : playerDetails?.demeanor.value < neutral
                  ? "Depressed"
                  : "Neutral")}
            </div>
          </div>
          <div className="__buttons_container flex flex-row relative gap-0 left-6">
            <div
              className="__red h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${
                  playerDetails?.demeanor?.value != null &&
                  (playerDetails?.demeanor.value > neutral
                    ? red_buttons[2]
                    : playerDetails?.demeanor.value < neutral
                    ? red_buttons[0]
                    : red_buttons[1])
                })`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
              onClick={() => {
                fightAction(account, 0).then((e) => {
                  setFightTxHash(e);
                });
              }}
            ></div>
            <div
              className="__green h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${
                  playerDetails?.demeanor?.value != null &&
                  (playerDetails?.demeanor.value > neutral
                    ? green_buttons[2]
                    : playerDetails?.demeanor.value < neutral
                    ? green_buttons[0]
                    : green_buttons[1])
                })`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
              onClick={() => {
                fightAction(account, 1).then((e) => {
                  setFightTxHash(e);
                });
              }}
            ></div>
            <div
              className="__blue h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${
                  playerDetails?.demeanor?.value != null &&
                  (playerDetails?.demeanor.value > neutral
                    ? blue_buttons[2]
                    : playerDetails?.demeanor.value < neutral
                    ? blue_buttons[0]
                    : blue_buttons[1])
                })`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
              onClick={() => {
                fightAction(account, 2).then((e) => {
                  setFightTxHash(e);
                });
              }}
            ></div>
            <div
              className="__other h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${other_buttons.block})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
              onClick={() => {
                fightAction(account, 0).then((e) => {
                  setFightTxHash(e);
                });
              }}
            ></div>
            <div
              className="__critical h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${other_buttons.specialAttack})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
            ></div>
          </div>
        </div>
        <div
          className="__turn flex w-[150px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
          style={{
            backgroundImage: `url(${turn_wrapper})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            visibility: playerTurn ? "hidden" : "visible"
          }}
          onClick={() => {
            setMovePlayer(true);
            setTimeout(() => {
              resolveAction(account).then((e) => {
                setFightTxHash(e);
              });
            }, 500);
          }}
        ></div>
      </div>
    </div>
  );
};

export default Fight;

// Generic metadata structure for a field
interface MetadataField<T> {
  type: string;
  type_name: string;
  value: T;
  key: boolean;
}

// Specific field types
type PrimitiveField<T> = MetadataField<T>;
type ContractAddressField = MetadataField<string>;
type StructField<T> = MetadataField<T>;
type ByteArrayField = MetadataField<string>; // For `skin`, `mugshot`, `sprites`

// Define the UEnemy structure
interface UEnemy {
  idle_sprite: ByteArrayField;
  mugshot: ByteArrayField;
  special_attack: PrimitiveField<boolean>;
  attack_sprite: ByteArrayField;
  hit_sprite: ByteArrayField;
  max_health: PrimitiveField<number>;
  level: PrimitiveField<number>;
  uid: PrimitiveField<number>;
  health: PrimitiveField<number>;
  attack_power: PrimitiveField<number>;
  skin: ByteArrayField;
  folder: ByteArrayField;
}

// Define the PlayableCharacter structure
interface PlayableCharacter {
  skin: ByteArrayField;
  level: PrimitiveField<number>;
  folder: ByteArrayField;
  uid: PrimitiveField<number>;
  mugshot: ByteArrayField;
  special_attack: PrimitiveField<boolean>;
  idle_sprite: ByteArrayField;
  hit_sprite: ByteArrayField;
  attack_power: PrimitiveField<number>;
  health: PrimitiveField<number>;
  max_health: PrimitiveField<number>;
  attack_sprite: ByteArrayField;
}

// Define the Player structure
export interface LuttePlayer {
  demeanor: PrimitiveField<number>;
  health: PrimitiveField<number>;
  skin_id: PrimitiveField<number>;
  special_attack: PrimitiveField<boolean>;
  last_attack: PrimitiveField<boolean>;
  attack_power: PrimitiveField<number>;
  address: ContractAddressField; // ContractAddress (key)
  current_enemy: StructField<UEnemy>; // Struct: UEnemy
  character: StructField<PlayableCharacter>; // Struct: PlayableCharacter
}

// Define the root object structure for the `lutte-Player`
export interface ILuttePlayerData {
  "lutte-Player": LuttePlayer;
}
