import { useLocation } from "react-router-dom";
import fight_bg from "../assets/placeholders/fight_bg.png";
import blue_icon from "../assets/placeholders/blueIcon.png";
import green_icon from "../assets/placeholders/greenIcon.png";
import red_icon from "../assets/placeholders/redIcon.png";

interface IplayableCharacter {
  uid: number;
  characterImage: string;
  enemyImage: string;
}
const Fight = () => {
  const { state } = useLocation();

  const playable_character = state as IplayableCharacter;
  return (
    <div
      className="flex justify-center items-center w-screen h-screen text-center flex-col bg-[#3b2f2f]"
      style={{
        backgroundImage: `url(${fight_bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="__fight_canvas w-full h-full flex flex-row justify-between px-1 md:px-20 relative max-w-[1500px]">
        <div className="__left_character flex items-end relative gap-0 h-fit self-end">
          <div className="__action_buttons flex flex-col absolute top-0 w-[150px] gap-4 self-center z-10 bottom-0">
            <img
              src={red_icon}
              alt="red_icon"
              className="h-15 w-16 self-end hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
            />
            <img
              src={blue_icon}
              alt="blue_icon"
              className="h-15 w-16 self-start hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
            />
            <img
              src={green_icon}
              alt="green_icon"
              className="h-15 w-16 self-end hover:cursor-pointer hover:scale-110 hover:opacity-90 active:scale-95 active:opacity-70 transition-transform duration-300"
            />
          </div>

          <img
            src={playable_character.characterImage}
            alt=""
            className="player_img max-h-[30rem] relative left-2"
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
      <div className="__bottom_tab bg-gray-600 h-40 w-full absolute bottom-0 hidden"></div>
    </div>
  );
};

export default Fight;
