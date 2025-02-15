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
import png_sprite from "../assets/placeholders/correct_idlesprite.png";
import player_attack_sprite from "../assets/placeholders/attacksprite.png";
import pfp from "../assets/placeholders/female.png";
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

const Fight = () => {
  async function fetchUser(address: string) {
    const res = await sdk.client.getEntities(
      new ToriiQueryBuilder()
        .withClause(
          new ClauseBuilder<LutteSchemaType>()
            .keys(["lutte-Player"], [address], "VariableLen")
            .build()
        )
        .withLimit(2)
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
    playerDetails?.last_attack || false
  );

  const fightAction = async (
    account: AccountInterface | undefined,
    id: number
  ): Promise<string | undefined> => {
    // playerDetails &&
    //   playerDetails.last_attack.value == true &&
    setIsPlayerAttacking(true);
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
        .then((e) => {
          console.log(e.transaction_hash);
          console.log("fight successful");
          setIsPlayerAttacking(false);
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

  const defendAction = async (
    account: AccountInterface | undefined
  ): Promise<string | undefined> => {
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
          <div className="__characters flex flex-row w-full justify-between relative group">
            <div
              className={`__left_character aspect-[1200/734] flex justify-center items-center w-[35vw] h-[35vw] max-h-[800px] max-w-[800px] relative self-end transition-transform duration-500 ${
                isPlayerAttacking
                  ? "translate-x-[30vw] scale-100"
                  : "translate-x-0"
              } ${isPlayerAttacking ? "z-10" : "z-0"}`}
            >
              <Spritesheet
                key={isPlayerAttacking ? "attack" : "idle"}
                ref={PlayerAnimation}
                image={isPlayerAttacking ? player_attack_sprite : png_sprite}
                widthFrame={1200}
                heightFrame={734}
                steps={isPlayerAttacking ? 5 : 6}
                fps={isPlayerAttacking ? 10 : 5}
                autoplay
                loop={isPlayerAttacking ? false : true}
                style={{
                  display: "block",
                  height: "100%",
                  width: "100%",
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "cover",
                  transform: "scale(2)",
                  transformOrigin: "center center"
                  // marginBottom: "-30vw"
                }}
                direction="forward"
              />
            </div>

            <div
              className={`__right_character aspect-[1333/750] flex justify-center items-center w-[35vw] h-[35vw] max-h-[800px] max-w-[800px] relative self-end ${
                isPlayerAttacking ? "z-0" : "z-10"
              }`}
            >
              <Spritesheet
                key={isPlayerAttacking ? "attack" : "idle"}
                ref={EnemyAnimation}
                image={
                  isPlayerAttacking
                    ? (playerDetails?.current_enemy.value.idle_sprite
                        .value as string)
                    : (playerDetails?.current_enemy.value.hit_sprite
                        .value as string)
                }
                widthFrame={1333}
                heightFrame={750}
                steps={isPlayerAttacking ? 5 : 6}
                fps={isPlayerAttacking ? 10 : 5}
                autoplay={true}
                loop={true}
                style={{
                  height: "100%",
                  display: "block",
                  maxHeight: "100%",
                  objectFit: "cover",
                  transform: "scale(0.73)", // ✅ Slight zoom-in
                  transformOrigin: "center center"
                  // marginBottom: "35vh"
                }}
                direction="forward"
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
              src={pfp}
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
            defendAction(account).then((e) => {
              setFightTxHash(e);
            });
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
  idle_sprite: ByteArrayField; // ByteArray (URL)
  mugshot: ByteArrayField; // ByteArray (URL)
  special_attack: PrimitiveField<boolean>; // bool
  attack_sprite: ByteArrayField; // ByteArray (URL)
  hit_sprite: ByteArrayField; // ByteArray (URL)
  max_health: PrimitiveField<number>; // u32
  level: PrimitiveField<number>; // u8
  uid: PrimitiveField<number>; // u32
  health: PrimitiveField<number>; // u32
  attack_power: PrimitiveField<number>; // u8
  skin: ByteArrayField; // ByteArray (URL)
}

// Define the Player structure
export interface LuttePlayer {
  demeanor: PrimitiveField<number>; // u8
  health: PrimitiveField<number>; // u32
  skin_id: PrimitiveField<number>; // u8
  special_attack: PrimitiveField<boolean>; // bool
  last_attack: PrimitiveField<boolean>; // bool
  attack_power: PrimitiveField<number>; // u8
  address: ContractAddressField; // ContractAddress (key)
  current_enemy: StructField<UEnemy>; // Struct: UEnemy
}
