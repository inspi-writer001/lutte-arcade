import { useLocation } from "react-router-dom";
import fight_bg from "../assets/placeholders/fight_bg.png";
import component_wrapper from "../assets/bottom_components/bottom_ui.png";
import turn_wrapper from "../assets/bottom_components/endturn.png";
// import { useStore } from "../store/GameStore";
import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { Player } from "../Helpers/models.gen";
import { AccountInterface } from "starknet";
import { CONTRACT_ADDRESS } from "../constants";
import HealthBar from "../Components/Healthbar";

import {
  red_buttons,
  blue_buttons,
  green_buttons,
  other_buttons
} from "../Components/Buttons";

interface IplayableCharacter {
  uid: number;
  characterImage: string;
  enemyImage: string;
}
const Fight = () => {
  const { state } = useLocation();
  // const { sdk } = useStore();
  const { account } = useAccount();
  const [isPlayerLoading, _setIsPlayerLoading] = useState(true);
  const [playerDetails, _setPlayerDetails] = useState<Player>();
  const [_fightTxHash, setFightTxHash] = useState<string>();

  // useEffect(() => {
  //   if (address) {
  //     sdk?.getEntities(
  //       {
  //         lutte: {
  //           Player: {
  //             $: {
  //               where: {
  //                 address: { $eq: address }
  //               }
  //             }
  //           }
  //         }
  //       },
  //       (response) => {
  //         if (response.data) {
  //           setIsPlayerLoading(false);
  //           console.log("Fetched player:", response.data);
  //           setPlayerDetails(response.data[0].models.lutte.Player as Player);
  //         } else if (response.error) {
  //           console.error("Fetch error:", response.error);
  //         }
  //       }
  //     );
  //   }
  // }, [fightTxHash]);

  const playable_character = state as IplayableCharacter;
  return (
    <div className="flex justify-center items-center w-screen max-h-screen text-center flex-col bg-[#3b2f2f]">
      <div
        className="flex h-[83vh] w-full relative"
        style={{
          backgroundImage: `url(${fight_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="__fight_canvas w-full h-full max-h-[83vh] flex flex-col justify-between px-1 md:px-20 relative max-w-[1500px] overflow-hidden ">
          <div className="__health flex flex-row justify-between w-full">
            <div className="__character_health flex self-start min-w-[30%] flex-col mt-6 items-start">
              <HealthBar
                percentage={((playerDetails?.health || 100) / 200) * 100}
              />
              {/* <p>
                Health: {isPlayerLoading ? "Loading..." : playerDetails?.health}
              </p> */}
              <p>
                Demeanor:{" "}
                {isPlayerLoading ? "Loading..." : playerDetails?.demeanor}
              </p>
            </div>
            <div className="__character_health flex self-start min-w-[30%] flex-col mt-6 items-end">
              <div className="__flipped_appearance transform scale-x-[-1]">
                <HealthBar
                  percentage={
                    ((playerDetails?.current_enemy.health || 100) / 200) * 100
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
                  : playerDetails?.current_enemy.attack_power}
              </p>
            </div>
          </div>

          {/* Ensure the characters' container does not overflow */}
          {/* h-[calc(100%-120px)] */}
          <div className="__characters flex flex-row w-full justify-between relative">
            <div className="__left_character flex items-end relative gap-0 h-fit self-end bottom-0">
              {/* <div className="__action_buttons flex flex-col absolute top-0 w-[150px] gap-4 self-center z-10 bottom-0">
                <img
                  src={red_icon}
                  alt="red_icon"
                  className="h-15 w-16 self-end hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
                  onClick={() => {
                    fightAction(account, 0).then((e) => {
                      setFightTxHash(e);
                    });
                  }}
                />
                <img
                  src={blue_icon}
                  alt="blue_icon"
                  className="h-15 w-16 self-start hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
                  onClick={() => {
                    fightAction(account, 2).then((e) => {
                      setFightTxHash(e);
                    });
                  }}
                />
                <img
                  src={green_icon}
                  alt="green_icon"
                  className="h-15 w-16 self-end hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
                  onClick={() => {
                    fightAction(account, 1).then((e) => {
                      setFightTxHash(e);
                    });
                  }}
                />
              </div> */}

              <img
                src={playable_character.characterImage}
                alt=""
                className="player_img max-h-[30rem] relative"
              />
            </div>

            <div className="__right_character flex items-end relative h-fit self-end">
              <img
                src={playable_character?.enemyImage}
                alt=""
                className="enemy_img max-h-[30rem]"
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
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <div className="__character_headshot h-20  w-36"></div>
          <div className="__buttons_container flex flex-row relative gap-0 left-6">
            <div
              className="__red w-[50px] h-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${red_buttons[0]})`,
                backgroundSize: "cover",
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
              className="__green w-[50px] h-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${green_buttons[0]})`,
                backgroundSize: "cover",
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
              className="__blue w-[50px] h-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${blue_buttons[0]})`,
                backgroundSize: "cover",
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
              className="__other w-[50px] h-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${other_buttons.block})`,
                backgroundSize: "cover",
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
              className="__critical w-[50px] h-[50px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
              style={{
                backgroundImage: `url(${other_buttons.specialAttack})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
              onClick={() => {
                fightAction(account, 0).then((e) => {
                  setFightTxHash(e);
                });
              }}
            ></div>
          </div>
        </div>
        <div
          className="__turn flex w-[150px] relative hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
          style={{
            backgroundImage: `url(${turn_wrapper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        ></div>
      </div>
    </div>
  );
};

export default Fight;

const fightAction = async (
  account: AccountInterface | undefined,
  id: number
): Promise<string | undefined> => {
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
        return e.transaction_hash;
      })
      .catch((error) => {
        console.log("error spawning character");
        console.log(error);
        throw error;
      });
};
