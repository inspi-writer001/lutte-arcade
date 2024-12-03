import { useEffect, useState } from "react";
import bgImage from "../assets/placeholders/start_plain.svg";
// import { useContractInstance } from "../hooks/useContract";
import "../styles/cards.css";
import { useStore } from "../store/GameStore";
import { useNavigate } from "react-router-dom";

const SelectCharacter = () => {
  // const contract = useContractInstance();

  const [data, setData] = useState<Array<Entity>>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // let [error, setError] = useState();
  // const [isSuccess, setIsSuccess] = useState(false);
  // const { account } = useAccount();
  const { sdk } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    sdk?.getEntities(
      {
        lutte: {
          PlayableCharacterList: {
            $: {
              where: { id: { $eq: 0 } }
            }
          }
        }
      },
      (response) => {
        if (response.data) {
          setIsLoading(false);
          console.log("Fetched entities:", response.data);
          setData(response.data as Entity[]);
        } else if (response.error) {
          console.error("Fetch error:", response.error);
        }
      }
    );
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
      <div className="__upper_text text-center font-bold text-7xl mb-7">
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
            className="__player_boxed grid gap-4 max-w-[1024px] hover:cursor-pointer overflow-y-scroll"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)", // 3 items per row
              gridAutoRows: "minmax(20rem, auto)", // Ensure rows adapt to content
              overflowY: "scroll", // Enable vertical scrolling
              maxHeight: "80vh", // Set a maximum height for the container
              justifyItems: "center" // Center items in their columns
            }}
          >
            {data &&
              data[0]?.models?.lutte?.PlayableCharacterList?.players?.map(
                (player: any, index: number) => {
                  // Determine if this is the last item and adjust its position
                  const isLastItem =
                    index ===
                    data[0]?.models?.lutte?.PlayableCharacterList?.players
                      ?.length -
                      1;
                  const totalItems =
                    data[0]?.models?.lutte?.PlayableCharacterList?.players
                      ?.length;

                  return (
                    <div
                      key={player.uid} // Use `uid` as a unique key
                      className="__selectable_player player_card flex relative bg-red-500 border-black border-4 min-w-72"
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
                        navigate("/fight", {
                          state: {
                            id: player.uid,
                            characterImage: `https://bronze-petite-viper-118.mypinata.cloud/ipfs/${player.skin}`,
                            enemyImage: `https://bronze-petite-viper-118.mypinata.cloud/ipfs/${data[0]?.models?.lutte?.PlayableCharacterList?.players[0].skin}`
                          }
                        });
                      }}
                    >
                      <img
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        style={{
                          objectPosition: "center top",
                          transform: "scale(2)", // Optional zoom effect
                          marginTop: "10rem" // Adjust to center the desired portion
                        }}
                        src={`https://bronze-petite-viper-118.mypinata.cloud/ipfs/${player.skin}`}
                        alt={player.skin}
                      />
                    </div>
                  );
                }
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectCharacter;

interface PlayableCharacter {
  skin: string;
  level: number;
  attack_power: number;
  special_attack: boolean;
  uid: number;
  health: number;
}

// Interface for the PlayableCharacterList
interface PlayableCharacterList {
  players: PlayableCharacter[];
  id: number;
}

// Interface for the lutte models
interface LutteModels {
  PlayableCharacterList: PlayableCharacterList;
}

// Interface for the models
interface Models {
  lutte: LutteModels;
}

// Interface for the entire entity
interface Entity {
  entityId: string;
  models: Models;
}
