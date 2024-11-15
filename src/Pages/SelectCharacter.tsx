import player1 from "../assets/placeholders/players/lutte_player1.png";
import player2 from "../assets/placeholders/players/lutte_player2.png";
import player3 from "../assets/placeholders/players/lutte_player3.png";
import bgImage from "../assets/placeholders/start_plain.svg";
import "../styles/cards.css";

const player_array: Array<IPlayableCharacter> = [
  {
    id: 1,
    image_url: player1,
    player_name: "Xin"
  },
  {
    id: 2,
    image_url: player2,
    player_name: "Xou"
  },
  {
    id: 1,
    image_url: player3,
    player_name: "Xai"
  }
];

const SelectCharacter = () => {
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
        <div className="__player_boxed flex flex-row justify-evenly max-w-[1024px] gap-4 hover:cursor-pointer">
          {player_array.map((player) => {
            return (
              <div className="__selectable_player player_card flex">
                <img
                  className="border-black border-4"
                  src={player.image_url}
                  alt={player.player_name}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectCharacter;

interface IPlayableCharacter {
  id: number;
  image_url: string;
  player_name: string;
}
