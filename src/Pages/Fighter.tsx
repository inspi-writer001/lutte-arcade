import { useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import fight_bg from "../assets/placeholders/fight_bg.png";
import component_wrapper from "../assets/bottom_components/button_ui_panel.png";
import ui_component_wrapper from "../assets/bottom_components/ui_panel_rack.png";
import turn_wrapper from "../assets/bottom_components/turn_wrapper.png";
import turn from "../assets/bottom_components/turn.png";
import { useEffect, useState } from "react";
import { SchemaType as LutteSchemaType } from "../Helpers/models.gen";
import {
  AccountInterface,
  RpcProvider,
  TransactionExecutionStatus
} from "starknet";
import { CONTRACT_ADDRESS } from "../constants";
import HealthBar from "../Components/Healthbar";
import game_over from "../assets/gameover.jpg";

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

import { Assets, Texture, Spritesheet, TextureSource } from "pixi.js";
import PixiBunny from "./PixiBunny";

import {
  attack_1,
  attack_2,
  attack_3,
  death,
  dodge,
  playSound
} from "../Helpers/audio";
// import { provider } from "../App";
import { dojoConfig } from "../dojoConfig";
import WinProceed from "../Components/WinProceed";

let depressed = 0; // 0-5
let neutral = 6; // 6-15
let motivated = 16; // 16-20

// last attack state can be 0, 1, 2, 3, 4 -- 1- successful attack, 2- glazed attack, 3- missed
// attack, 4- critical attack, 0- not yet attacked

interface IEntity {
  png: string;
  json: string;
}

const Fight = () => {
  async function fetchUser(address: string) {
    const res = await sdk.client.getEntities(
      new ToriiQueryBuilder()
        .withClause(
          new ClauseBuilder<LutteSchemaType>()
            .where("lutte-Player", "address", "Eq", padHexTo66(address))
            .build()
        )
        .build()
    );

    // console.log(res);

    // return res;
    return res.items?.[0]?.models[
      "lutte-Player"
    ] as unknown as LuttePlayerWrapper;
  }
  const { account } = useAccount();
  const { state } = useLocation();
  const { sdk } = useDojoSDK();

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showGameWon, setShowGameWon] = useState(false);

  const navigate = useNavigate();
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);

  const [playerDetails, setPlayerDetails] = useState<LuttePlayerWrapper>();
  const [cacheUser, setCacheUser] = useState<LuttePlayerWrapper>();
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

  const [characterTextures, setCharacterTextures] =
    useState<Texture<TextureSource<any>>[][]>();

  const [enemyTextures, setEnemyTextures] =
    useState<Texture<TextureSource<any>>[][]>();

  if (!state?.address) return navigate("/");

  useEffect(() => {
    fetchUser(state.address).then((response) => {
      if (response) {
        setPlayerDetails(response);
        setCacheUser(response);
      } else {
        console.warn("No player data found.");
      }
      setIsPlayerLoading(false);
    });
  }, []);

  const provider = new RpcProvider({
    nodeUrl: dojoConfig.rpcUrl as string
  });

  const attacks = [attack_1, attack_2, attack_3];
  const randomAttack = attacks[Math.floor(Math.random() * attacks.length)];

  // ✅ Preload all images to prevent jank
  useEffect(() => {
    const preloadImages = async (urls: IEntity[]) => {
      const loadSpritesheet = async (entity: IEntity) => {
        try {
          const response = await fetch(entity.json);
          const spritesheetData = await response.json();

          if (!spritesheetData.frames) {
            throw new Error("Invalid spritesheet: 'frames' key missing.");
          }

          const texture = await Assets.load(entity.png);

          const spritesheet = new Spritesheet(texture, spritesheetData);

          await spritesheet.parse();

          const animationTextures = Object.keys(spritesheetData.frames).map(
            (frameName) => spritesheet.textures[frameName]
          );

          if (animationTextures.length === 0) {
            throw new Error("No frames found in spritesheet.");
          }

          return animationTextures;
        } catch (error) {
          console.error("Error loading spritesheet:", error);
          return [];
        }
      };

      const assetsPromises = urls.map((url) =>
        loadSpritesheet({ json: url.json, png: url.png })
      );

      return Promise.all(assetsPromises);
    };

    if (playerDetails?.character?.value) {
      preloadImages([
        {
          json:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.idle_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.idle_sprite.value +
            "/spritesheet.png"
        },
        {
          json:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.attack_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.attack_sprite.value +
            "/spritesheet.png"
        },
        {
          json:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.dash_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.dash_sprite.value +
            "/spritesheet.png"
        },
        {
          json:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.hit_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.hit_sprite.value +
            "/spritesheet.png"
        },

        {
          json:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.dodge_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.character.value.folder.value +
            playerDetails.character.value.dodge_sprite.value +
            "/spritesheet.png"
        }
      ]).then((response) => {
        setCharacterTextures(response);
        // setAssetsLoaded(true);
      });
    }

    if (playerDetails?.current_enemy?.value) {
      preloadImages([
        {
          json:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.idle_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.idle_sprite.value +
            "/spritesheet.png"
        },
        {
          json:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.attack_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.attack_sprite.value +
            "/spritesheet.png"
        },
        {
          json:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.dash_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.dash_sprite.value +
            "/spritesheet.png"
        },
        {
          json:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.hit_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.hit_sprite.value +
            "/spritesheet.png"
        },

        {
          json:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.dodge_sprite.value +
            "/spritesheet.json",
          png:
            playerDetails.current_enemy.value.folder.value +
            playerDetails.current_enemy.value.dodge_sprite.value +
            "/spritesheet.png"
        }
      ]).then((response) => {
        setEnemyTextures(response);
        setAssetsLoaded(true);
      });
    }
  }, [playerDetails]);

  useEffect(() => {
    if (playerDetails?.health.value === 0) {
      setIsResolveClickable(false);
      setIsActionClickable(false);
      const timer = setTimeout(() => {
        playSound(death);
        setShowGameOver(true);
      }, 3000);

      return () => clearTimeout(timer); // cleanup
    }
  }, [playerDetails?.health.value]);

  useEffect(() => {
    if (playerDetails?.current_enemy.value.health.value === 0) {
      setIsResolveClickable(false);
      setIsActionClickable(false);
      const timer = setTimeout(() => {
        playSound(death);
        setShowGameWon(true);
      }, 3000);

      return () => clearTimeout(timer); // cleanup
    }
  }, [playerDetails?.current_enemy.value.health.value]);

  const [playerTurn, setPlayerTurn] = useState(
    !Boolean(playerDetails?.last_attack.value)
  );

  const compareCache = (
    newData: LuttePlayerWrapper,
    previousData: LuttePlayerWrapper | undefined
  ) => {
    if (!previousData) return;

    const user_previous_health = previousData.health.value;
    const enemy_previous_health = previousData.current_enemy.value.health.value;
    const user_new_health = newData.health.value;
    const enemy_new_health = newData.current_enemy.value.health.value;

    return {
      enemy_health_dif: enemy_previous_health - enemy_new_health,
      user_health_diff: user_previous_health - user_new_health
    };
  };

  const fightAction = async (
    account: AccountInterface | undefined,
    id: number
  ) => {
    setIsActionClickable(false);

    if (!account) return;

    try {
      const result = await account.execute([
        {
          contractAddress: CONTRACT_ADDRESS,
          entrypoint: "offensive_phase",
          calldata: [id]
        }
      ]);
      const txHash = result.transaction_hash;

      // console.log("Waiting for tx to be accepted: ", txHash);

      await provider.waitForTransaction(txHash, {
        retryInterval: 500,
        successStates: [TransactionExecutionStatus.SUCCEEDED]
        // retryTimeout: 60000 // timeout in ms
      });

      // console.log("Transaction accepted!");
      // setIsResolveClickable(true);

      setIsResolveClickable(true);
      return txHash;
    } catch (error) {
      console.error("Fight failed: ", error);
      setPlayerMovement("idle");
      throw error;
    }
  };

  const resolveAction = async (): Promise<LuttePlayerWrapper> => {
    return fetchUser(state.address).then((response) => {
      setPlayerDetails(response);
      setPlayerTurn(!Boolean(response.last_attack.value));
      setIsActionClickable(true);
      setIsResolveClickable(false);
      return response;
    });
  };
  const defendAction = async (
    account: AccountInterface | undefined,
    id: number
  ): Promise<string | undefined> => {
    setIsActionClickable(false);
    if (!account) return;

    try {
      const result = await account.execute([
        {
          contractAddress: CONTRACT_ADDRESS,
          entrypoint: "defensive_phase",
          calldata: [id]
        }
      ]);
      const txHash = result.transaction_hash;

      await provider.waitForTransaction(txHash, {
        retryInterval: 500,
        successStates: [TransactionExecutionStatus.SUCCEEDED]
        // retryTimeout: 60000 // timeout in ms
      });

      setIsResolveClickable(true);
      return txHash;
    } catch (error) {
      throw error;
    }
  };

  const getSpriteImage = (
    movement: typeof playerMovement | typeof enemyMovement,
    type: "player" | "enemy"
  ): Texture[] => {
    if (
      !playerDetails?.character?.value ||
      !characterTextures ||
      !enemyTextures
    ) {
      return [];
    }

    const folder = type === "player" ? characterTextures : enemyTextures;
    if (!folder) return [];

    switch (movement) {
      case "attack":
        return folder[1] || [];
      case "dash":
        return folder[2] || [];
      case "hit":
        return folder[3] || [];
      case "dodge":
        return folder[4] || [];
      default:
        return folder[0] || [];
    }
  };

  if (!playerDetails?.last_attack) return;

  if (showGameOver) {
    return (
      <div className="w-full h-full flex justify-center items-center relative">
        <img src={game_over} height="100%" width="100%" />
        <h1
          className="absolute pirata-one font-bold text-4xl mt-36 hover:cursor-pointer w-[300px] text-center bg-gray-950 py-3"
          onClick={() => navigate("/")}
        >
          Go Home
        </h1>
      </div>
    );
  }

  if (showGameWon) {
    return (
      <WinProceed enemy_level={playerDetails.current_enemy.value.level.value} />
    );
  }

  if (!assetsLoaded) {
    return (
      <div className="__loading_screen pirata-one flex w-full h-full text-center justify-center items-center text-2xl p-4">
        Loading...
      </div>
    );
  } else
    return (
      <div
        className="names_container flex justify-center items-center w-screen max-h-screen text-center flex-col relative max-w-[2000px]"
        style={{
          aspectRatio: "16 / 9"
        }}
      >
        <div
          className="flex w-full relative justify-center"
          style={{
            backgroundImage: `url(${fight_bg})`,
            backgroundSize: "cover", // fill the container, maintain aspect ratio
            backgroundPosition: "bottom center", // align the grass area to bottom
            backgroundRepeat: "no-repeat",
            width: "100%",
            height: "83dvh" // or remove aspectRatio entirely
          }}
        >
          <div className="__fight_canvas w-full h-full max-h-[83dvh] flex flex-col justify-between px-1 md:px-20 relative max-w-[1500px] overflow-hidden">
            <div className="__health flex flex-row justify-between w-full mt-4">
              <div className="__character_health flex self-start min-w-[30%] flex-col mt-6 items-start">
                <HealthBar
                  percentage={
                    ((playerDetails?.health.value || 0) /
                      playerDetails?.character.value.max_health.value) *
                    100
                  }
                />

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

                <p className="text-yellow-800">
                  Health:{" "}
                  {isPlayerLoading
                    ? "Loading..."
                    : playerDetails?.current_enemy.value.health.value}
                </p>
              </div>
            </div>

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
                <PixiBunny
                  key={"player"}
                  textures={getSpriteImage(playerMovement, "player")}
                  playerMovement={playerMovement}
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
                
                ${
                  enemyMovement == "dash" || enemyMovement == "attack"
                    ? "-translate-x-[78%] z-20"
                    : "translate-x-0 z-10"
                }
              `}
              >
                <div className="absolute">
                  <PixiBunny
                    key={"enemy"}
                    textures={getSpriteImage(enemyMovement, "enemy")}
                    playerMovement={enemyMovement}
                  />
                </div>
              </div>
            </div>
            {/* Ensure the characters' container does not overflow */}
            {/* h-[calc(100%-120px)] */}
            {/* <div className="__characters flex w-full justify-between relative group"></div> */}
          </div>
        </div>

        {/* here */}
        <div
          className="__bottom_tab bg-black h-[15dvh] w-[90vw] max-w-[2000px] relative bottom-1 flex flex-row justify-between "
          style={{
            backgroundImage: `url(${ui_component_wrapper})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            aspectRatio: "16 / 9"
          }}
        >
          {playerState == "attack" ? (
            <div
              className="__actions_buttons flex w-[450px] relative flex-row items-center ml-[clamp(14rem,15%,4rem)]"
              style={{
                backgroundImage: `url(${component_wrapper})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"

                // visibility: playerTurn ? "visible" : "hidden"
              }}
            >
              <div className="__character_headshot h-20 w-36 flex flex-row">
                <img
                  src={
                    playerDetails.character.value.folder.value +
                    playerDetails.character.value.mugshot.value
                  }
                  alt="profile picture"
                  className="ml-2 p-3 pirata-one"
                />
                <div className="__excitement text-amber-300 self-end mb-3 unifrakturmaguntia">
                  {playerDetails?.demeanor?.value != null &&
                    (playerDetails?.demeanor.value > neutral
                      ? "Motivated"
                      : playerDetails?.demeanor.value < neutral
                      ? "Depressed"
                      : "Neutral")}
                </div>
              </div>
              <div
                className="__buttons_container flex flex-row relative gap-2 left-6"
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
                    fightAction(account, 0);
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
                    fightAction(account, 1);
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
                    fightAction(account, 2);
                  }}
                ></div>
                <div className="__other h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"></div>
                <div className="__critical h-[50px] w-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"></div>
              </div>
            </div>
          ) : (
            <div
              className="__defense_buttons flex w-[450px] relative flex-row items-center ml-[clamp(14rem,15%,4rem)]"
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
                  alt="profile picture"
                  className="ml-2 p-3 pirata-one"
                />
                <div className="__excitement text-amber-300 self-end mb-3 unifrakturmaguntia">
                  {playerDetails?.demeanor?.value != null &&
                    (playerDetails?.demeanor.value > neutral
                      ? "Motivated"
                      : playerDetails?.demeanor.value < neutral
                      ? "Depressed"
                      : "Neutral")}
                </div>
              </div>
              <div
                className="__buttons_container flex flex-row relative gap-2 left-6"
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
            <div className="__phase pirata-one flex self-center text-4xl mr-0">
              {playerTurn == true && playerState == "attack"
                ? "Attack Phase"
                : "Defensive Phase"}
            </div>
          }
          <div
            className="__resolve flex w-[150px] relative justify-center hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300 p-11 mr-[clamp(14rem,15%,4rem)] z-30"
            style={{
              backgroundImage: `url(${turn_wrapper})`,
              backgroundSize: "center",
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

                // Shorter dash duration to keep the flow smooth
                await new Promise((resolve) => setTimeout(resolve, 500));
                setEnemyMovement("attack");

                // Allow attack animation to play before resolving action
                await new Promise((resolve) => setTimeout(resolve, 150));

                // Resolve action and calculate health difference
                const e = await resolveAction();
                const diff = compareCache(e, cacheUser);
                if (!diff) return;

                if (diff.user_health_diff > 0) {
                  playSound(randomAttack);
                  setPlayerMovement("hit");
                } else {
                  setPlayerMovement("dodge");
                  playSound(dodge);
                }

                setCacheUser(e);

                // Wait for player reaction animation to finish
                await new Promise((resolve) => setTimeout(resolve, 1200));

                // Reset both to idle
                setEnemyMovement("idle");
                setPlayerMovement("idle");

                // Set up for next turn
                setPlayerState("attack");
                setSelectedButtonID(undefined);
              }

              if (
                playerState === "attack" &&
                typeof selectedButtonID !== "undefined"
              ) {
                setPlayerMovement("dash");

                // Dash duration
                await new Promise((resolve) => setTimeout(resolve, 500));
                setPlayerMovement("attack");

                // Wait for the attack animation to complete
                await new Promise((resolve) => setTimeout(resolve, 150));

                // Resolve the action
                const e = await resolveAction();
                const diff = compareCache(e, cacheUser);
                if (!diff) return;

                if (diff.enemy_health_dif > 0) {
                  playSound(randomAttack);
                  setEnemyMovement("hit");
                } else {
                  setEnemyMovement("dodge");
                  playSound(dodge);
                }

                setCacheUser(e);

                // Wait for the reaction animation (hit/dodge)
                await new Promise((resolve) => setTimeout(resolve, 1200));

                // Return both to idle
                setPlayerMovement("idle");
                setEnemyMovement("idle");

                // Switch to defense mode
                setPlayerState("defense");
                setSelectedButtonID(undefined);
              }
            }}
          >
            <img
              src={turn}
              alt="resolve turn icon"
              className="max-h-10 self-center"
            />
          </div>
        </div>
      </div>
    );
};

export default Fight;

export interface FetchUserResponse {
  items: Item[];
}

export interface Item {
  hashed_keys: string; // e.g., "0x0"
  models: {
    "lutte-Player": LuttePlayerWrapper;
  };
}

export interface LuttePlayerWrapper {
  last_attack_state: Primitive<u32>;
  attack_power: Primitive<u8>;
  special_attack: Primitive<boolean>;
  address: Primitive<string>; // ContractAddress
  health: Primitive<u32>;
  demeanor: Primitive<u8>;
  skin_id: Primitive<u8>;
  last_attack: Primitive<boolean>;
  current_enemy: Struct<SelectedEnemy>;
  character: Struct<SelectedCharacter>;
}

export interface Primitive<T> {
  type: "primitive";
  type_name: string;
  value: T;
  key: boolean;
}

export interface Struct<T> {
  type: "struct";
  type_name: string;
  value: T;
  key: boolean;
}

export interface ByteArray {
  type: "bytearray";
  type_name: "ByteArray";
  value: string;
  key: boolean;
}

export interface SelectedEnemy {
  gid: Primitive<u32>;
  health: Primitive<u32>;
  dash_sprite: ByteArray;
  hit_sprite: ByteArray;
  level: Primitive<u8>;
  idle_sprite: ByteArray;
  mugshot: ByteArray;
  max_health: Primitive<u32>;
  special_attack: Primitive<boolean>;
  attack_sprite: ByteArray;
  dodge_sprite: ByteArray;
  uid: Primitive<u32>;
  skin: ByteArray;
  folder: ByteArray;
  attack_power: Primitive<u8>;
}

export interface SelectedCharacter {
  mugshot: ByteArray;
  uid: Primitive<u32>;
  attack_power: Primitive<u8>;
  gid: Primitive<u32>;
  special_attack: Primitive<boolean>;
  folder: ByteArray;
  hit_sprite: ByteArray;
  idle_sprite: ByteArray;
  attack_sprite: ByteArray;
  max_health: Primitive<u32>;
  dodge_sprite: ByteArray;
  skin: ByteArray;
  dash_sprite: ByteArray;
  level: Primitive<u8>;
  health: Primitive<u32>;
}

// Type aliases for readability
type u8 = number;
type u32 = number;

// // Generic metadata structure for a field
// interface MetadataField<T> {
//   type: string;
//   type_name: string;
//   value: T;
//   key: boolean;
// }

// // Specific field types
// type PrimitiveField<T> = MetadataField<T>;
// type ContractAddressField = MetadataField<string>;
// type StructField<T> = MetadataField<T>;
// type ByteArrayField = MetadataField<string>; // For `skin`, `mugshot`, `sprites`

// // Define the UEnemy structure
// interface UEnemy {
//   idle_sprite: ByteArrayField;
//   mugshot: ByteArrayField;
//   special_attack: PrimitiveField<boolean>;
//   attack_sprite: ByteArrayField;
//   hit_sprite: ByteArrayField;
//   dash_sprite: ByteArrayField;
//   dodge_sprite: ByteArrayField;
//   max_health: PrimitiveField<number>;
//   level: PrimitiveField<number>;
//   uid: PrimitiveField<number>;
//   health: PrimitiveField<number>;
//   attack_power: PrimitiveField<number>;
//   skin: ByteArrayField;
//   folder: ByteArrayField;
// }

// // Define the PlayableCharacter structure
// interface PlayableCharacter {
//   skin: ByteArrayField;
//   level: PrimitiveField<number>;
//   folder: ByteArrayField;
//   uid: PrimitiveField<number>;
//   mugshot: ByteArrayField;
//   special_attack: PrimitiveField<boolean>;
//   idle_sprite: ByteArrayField;
//   hit_sprite: ByteArrayField;
//   dash_sprite: ByteArrayField;
//   dodge_sprite: ByteArrayField;
//   attack_power: PrimitiveField<number>;
//   health: PrimitiveField<number>;
//   max_health: PrimitiveField<number>;
//   attack_sprite: ByteArrayField;
// }

// // Define the Player structure
// export interface LuttePlayer {
//   demeanor: PrimitiveField<number>;
//   health: PrimitiveField<number>;
//   skin_id: PrimitiveField<number>;
//   special_attack: PrimitiveField<boolean>;
//   last_attack: PrimitiveField<boolean>;
//   attack_power: PrimitiveField<number>;
//   address: ContractAddressField; // ContractAddress (key)
//   current_enemy: StructField<UEnemy>; // Struct: UEnemy
//   character: StructField<PlayableCharacter>; // Struct: PlayableCharacter
// }

// // Define the root object structure for the `lutte-Player`
// export type ILuttePlayerData = LuttePlayer;
