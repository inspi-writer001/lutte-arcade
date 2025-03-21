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
import { padHexTo66 } from "../Helpers/converters";

let depressed = 0; // 0-5
let neutral = 6; // 6-15
let motivated = 16; // 16-20

// last attack state can be 0, 1, 2, 3, 4 -- 1- successful attack, 2- glazed attack, 3- missed
// attack, 4- critical attack, 0- not yet attacked

//  new ToriiQueryBuilder()
//    .withClause(
//      new ClauseBuilder<LutteSchemaType>()
//        .keys(["lutte-Player"], [address], "VariableLen")
//        .build()
//    )
//    .build();

const Fight = () => {
  async function fetchUser(address: string) {
    console.log("address: ", address);
    const res = await sdk.client.getEntities(
      new ToriiQueryBuilder()
        .withClause(
          new ClauseBuilder<LutteSchemaType>()
            .where("lutte-Player", "address", "Eq", padHexTo66(address))
            .build()
        )
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
  const [cacheUser, setCacheUser] = useState<LuttePlayer>();
  const [playerMovement, setPlayerMovement] = useState<
    "idle" | "dash" | "attack" | "dead" | "hit" | "dodge"
  >("idle");
  const [enemyMovement, setEnemyMovement] = useState<
    "idle" | "dash" | "attack" | "dead" | "hit" | "dodge"
  >("idle");
  const [isActionClicable, setIsActionClickable] = useState(true);
  const [isResolveClickable, setIsResolveClickable] = useState(false);
  const [playerState, setPlayerState] = useState<"attack" | "defense">(
    "attack"
  );

  const [selectedButtonID, setSelectedButtonID] = useState<number | undefined>(
    undefined
  );

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
      setCacheUser(response["0x0"]["lutte-Player"] as unknown as LuttePlayer);
      setIsPlayerLoading(false);
    });
  }, []);

  // ✅ Preload all images to prevent jank
  useEffect(() => {
    const preloadImages = (urls: string[]) => {
      urls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    };

    if (playerDetails?.character?.value) {
      preloadImages([
        playerDetails.character.value.folder.value +
          playerDetails.character.value.idle_sprite.value,
        playerDetails.character.value.folder.value +
          playerDetails.character.value.attack_sprite.value,
        playerDetails.character.value.folder.value +
          playerDetails.character.value.dash_sprite.value,
        playerDetails.character.value.folder.value +
          playerDetails.character.value.hit_sprite.value,
        playerDetails.character.value.folder.value +
          playerDetails.character.value.dodge_sprite.value
      ]);
    }

    if (playerDetails?.current_enemy?.value) {
      preloadImages([
        playerDetails.current_enemy.value.folder.value +
          playerDetails.current_enemy.value.idle_sprite.value,
        playerDetails.current_enemy.value.folder.value +
          playerDetails.current_enemy.value.attack_sprite.value,
        playerDetails.current_enemy.value.folder.value +
          playerDetails.current_enemy.value.dash_sprite.value,
        playerDetails.current_enemy.value.folder.value +
          playerDetails.current_enemy.value.hit_sprite.value,
        playerDetails.current_enemy.value.folder.value +
          playerDetails.current_enemy.value.dodge_sprite.value
      ]);
    }
  }, [playerDetails]);

  const [playerTurn, setPlayerTurn] = useState(
    !Boolean(playerDetails?.last_attack.value)
  );

  const compareCache = (
    newData: LuttePlayer,
    previousData: LuttePlayer | undefined
  ) => {
    if (!previousData) return;
    let user_previous_health = previousData.health.value;
    let enemy_previous_health = previousData.current_enemy.value.health.value;

    let user_new_health = newData.health.value;
    let enemy_new_health = newData.current_enemy.value.health.value;

    let user_health_diff = Math.abs(user_previous_health - user_new_health);
    let enemy_health_dif = Math.abs(enemy_previous_health - enemy_new_health);

    return {
      enemy_health_dif,
      user_health_diff
    };
  };

  const fightAction = async (
    account: AccountInterface | undefined,
    id: number
  ): Promise<string | undefined> => {
    setIsActionClickable(false);
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
          setIsResolveClickable(true);
          return e.transaction_hash;
        })
        .catch((error) => {
          console.log("error attacking character");
          setPlayerMovement("idle");
          console.log(error);
          throw error;
        });
  };

  const resolveAction = async (): Promise<LuttePlayer> => {
    return fetchUser(state.address).then((response) => {
      console.log("account user");
      console.log(response);

      let typed_response = response["0x0"][
        "lutte-Player"
      ] as unknown as LuttePlayer;
      setPlayerDetails(typed_response);
      setPlayerTurn(!Boolean(typed_response.last_attack.value));

      setIsActionClickable(true);
      setIsResolveClickable(false);

      return typed_response;
    });
  };

  const defendAction = async (
    account: AccountInterface | undefined,
    id: number
  ): Promise<string | undefined> => {
    setIsActionClickable(false);
    if (account)
      return account
        ?.execute([
          {
            contractAddress: CONTRACT_ADDRESS,
            entrypoint: "defensive_phase",
            calldata: [id]
          }
        ])
        .then((e) => {
          console.log(e.transaction_hash);
          console.log("defebnse successful");

          setIsResolveClickable(true);

          return e.transaction_hash;
        })
        .catch((error) => {
          console.log("error defending character");
          console.log(error);
          throw error;
        });
  };

  const getSpriteImage = (
    movement: typeof playerMovement | typeof enemyMovement,
    type: "player" | "enemy"
  ) => {
    if (!playerDetails?.character?.value) return "";
    const folder =
      type == "player"
        ? playerDetails.character.value.folder.value
        : playerDetails.current_enemy.value.folder.value;

    switch (movement) {
      case "attack":
        return (
          folder +
          (type == "player"
            ? playerDetails.character.value.attack_sprite.value
            : playerDetails.current_enemy.value.attack_sprite.value)
        );
      case "dash":
        return (
          folder +
          (type == "player"
            ? playerDetails.character.value.dash_sprite.value
            : playerDetails.current_enemy.value.dash_sprite.value)
        );
      case "hit":
        return (
          folder +
          (type == "player"
            ? playerDetails.character.value.hit_sprite.value
            : playerDetails.current_enemy.value.hit_sprite.value)
        );
      case "dodge":
        return (
          folder +
          (type == "player"
            ? playerDetails.character.value.dodge_sprite.value
            : playerDetails.current_enemy.value.dodge_sprite.value)
        );
      default:
        return (
          folder +
          (type == "player"
            ? playerDetails.character.value.idle_sprite.value
            : playerDetails.current_enemy.value.idle_sprite.value)
        );
    }
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
                percentage={
                  ((playerDetails?.health.value || 0) /
                    playerDetails?.character.value.max_health.value) *
                  100
                }
              />
              {/* <p>
                Health: {isPlayerLoading ? "Loading..." : playerDetails?.health}
              </p> */}
              <p className="text-yellow-800">
                Health:{" "}
                {isPlayerLoading ? "Loading..." : playerDetails?.health.value}
              </p>
            </div>
            <div className="__character_health flex self-start min-w-[30%] flex-col mt-6 items-end">
              <div className="__flipped_appearance transform scale-x-[-1]">
                <HealthBar
                  percentage={
                    ((playerDetails?.current_enemy.value.health.value || 0) /
                      playerDetails?.current_enemy.value.max_health.value) *
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
              <p className="text-yellow-800">
                Health:{" "}
                {isPlayerLoading
                  ? "Loading..."
                  : playerDetails?.current_enemy.value.health.value}
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
      aspect-[1200/884]         /* 1200×734 ratio for the sprite .. later added 150 */
      w-[47vw]               
      flex items-center justify-center
      relative self-end
      transition-transform duration-500
      overflow-hidden
      ${
        playerMovement == "dash" || playerMovement == "attack"
          ? "translate-x-[77%] z-20"
          : "translate-x-[0%] z-10"
      }
    `}
            >
              <Spritesheet
                key={playerMovement}
                ref={PlayerAnimation}
                image={getSpriteImage(playerMovement, "player")}
                widthFrame={1200}
                heightFrame={734}
                steps={
                  playerMovement == "attack"
                    ? 5
                    : playerMovement == "hit"
                    ? 3
                    : playerMovement == "dodge"
                    ? 2
                    : playerMovement == "dash"
                    ? 2
                    : 6
                }
                fps={
                  playerMovement == "idle"
                    ? 5
                    : playerMovement == "hit" || playerMovement == "dodge"
                    ? 2
                    : 5
                }
                autoplay
                loop={playerMovement == "idle"}
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
      aspect-[1333/900]         /* 1333×750 ratio for the enemy sprite ..later added 150 */
      w-[47vw]    
      flex items-center justify-center
      relative self-end transition-transform duration-500
      overflow-hidden
      ${
        enemyMovement == "dash" || enemyMovement == "attack"
          ? "-translate-x-[78%] z-20"
          : "translate-x-0 z-10"
      }
    `}
            >
              <Spritesheet
                key={`Enemy+${enemyMovement}`}
                ref={EnemyAnimation}
                image={getSpriteImage(enemyMovement, "enemy")}
                widthFrame={1333}
                heightFrame={750}
                steps={
                  enemyMovement == "attack"
                    ? 5
                    : enemyMovement == "hit"
                    ? 2
                    : enemyMovement == "dodge"
                    ? 2
                    : enemyMovement == "dash"
                    ? 2
                    : 7
                }
                fps={
                  enemyMovement == "attack"
                    ? 5
                    : enemyMovement == "hit" || enemyMovement == "dodge"
                    ? 2
                    : 6
                }
                autoplay
                loop={enemyMovement == "idle"}
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
        {playerState == "attack" ? (
          <div
            className="__actions_buttons flex w-[450px] relative flex-row items-center"
            style={{
              backgroundImage: `url(${component_wrapper})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"

              // visibility: playerTurn ? "visible" : "hidden"
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
            <div
              className="__buttons_container flex flex-row relative gap-0 left-6"
              style={{
                visibility: isActionClicable ? "visible" : "hidden"
              }}
            >
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
                  setSelectedButtonID(1);
                  fightAction(account, 1);
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
                  setSelectedButtonID(2);
                  fightAction(account, 2);
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
                  setSelectedButtonID(3);
                  fightAction(account, 3);
                }}
              ></div>
              <div className="__other h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"></div>
              <div className="__critical h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"></div>
            </div>
          </div>
        ) : (
          <div
            className="__defense_buttons flex w-[450px] relative flex-row items-center"
            style={{
              backgroundImage: `url(${component_wrapper})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
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
            <div
              className="__buttons_container flex flex-row relative gap-0 left-6"
              style={{
                visibility: isActionClicable ? "visible" : "hidden"
              }}
            >
              <div
                className="__other h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
                style={{
                  backgroundImage: `url(${other_buttons.block})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat"
                }}
                onClick={() => {
                  setSelectedButtonID(1);
                  defendAction(account, 0);
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
                onClick={() => {
                  setSelectedButtonID(2);
                  defendAction(account, 1);
                }}
              ></div>
              <div
                className="__empty h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
                style={{
                  backgroundImage: `url(${other_buttons.dodge})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat"
                }}
                onClick={() => {
                  setSelectedButtonID(3);
                  defendAction(account, 2);
                }}
              ></div>
              <div className="__empty h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"></div>
              <div className="__empty h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"></div>
            </div>
          </div>
        )}
        {
          <div className="__phase pirata-one flex self-center text-2xl mr-0">
            {playerTurn == true && playerState == "attack"
              ? "Attack Phase"
              : "Defensive Phase"}
          </div>
        }
        <div
          className="__resolve flex w-[150px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
          style={{
            backgroundImage: `url(${turn_wrapper})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            visibility:
              !isActionClicable && isResolveClickable ? "visible" : "hidden"
          }}
          onClick={async () => {
            if (
              playerState === "defense" &&
              typeof selectedButtonID !== "undefined"
            ) {
              setEnemyMovement("dash");

              // Wait for 1 second before switching to attack
              await new Promise((resolve) => setTimeout(resolve, 1000));
              setEnemyMovement("attack");

              // Ensure resolveAction completes before continuing
              const e = await resolveAction();
              let diff = compareCache(e, cacheUser);
              if (!diff) return;

              console.log(diff.user_health_diff);

              if (diff.user_health_diff > 0) {
                setPlayerMovement("hit");
              } else {
                setPlayerMovement("dodge");
              }

              setCacheUser(e);

              // Wait 1.5 seconds before switching enemy to idle
              await new Promise((resolve) => setTimeout(resolve, 1500));
              setEnemyMovement("idle");
              setPlayerMovement("idle");

              // Update player state after defense sequence
              setPlayerState("attack");
              setSelectedButtonID(undefined);
            }

            if (
              playerState == "attack" &&
              typeof selectedButtonID != "undefined"
            ) {
              setPlayerMovement("dash");

              await new Promise((resolve) => setTimeout(resolve, 1000));
              setPlayerMovement("attack");

              // Ensure resolveAction completes before continuing
              const e = await resolveAction();
              let diff = compareCache(e, cacheUser);
              if (!diff) return;

              console.log(diff.enemy_health_dif);

              if (diff.enemy_health_dif > 0) {
                setEnemyMovement("hit");
              } else {
                setEnemyMovement("dodge");
              }

              setCacheUser(e);

              // Wait 1.5 seconds before switching back to idle
              await new Promise((resolve) => setTimeout(resolve, 1500));
              setPlayerMovement("idle");
              setEnemyMovement("idle");

              setPlayerState("defense");
              setSelectedButtonID(undefined);
            }
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
  dash_sprite: ByteArrayField;
  dodge_sprite: ByteArrayField;
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
  dash_sprite: ByteArrayField;
  dodge_sprite: ByteArrayField;
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
export type ILuttePlayerData = LuttePlayer;
