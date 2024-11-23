import player1 from "../assets/placeholders/players/lutte_player1.png";
import player2 from "../assets/placeholders/players/lutte_player2.png";
import player3 from "../assets/placeholders/players/lutte_player3.png";
import bgImage from "../assets/placeholders/start_plain.svg";
// import { useContractInstance } from "../hooks/useContract";
import "../styles/cards.css";
import { useAccount, useCall } from "@starknet-react/core";
import contractABI from "../manifest_dev.json";
import { CONTRACT_ADDRESS } from "../constants";
import { useEffect, useState } from "react";
import { CallContractResponse } from "starknet";

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
    id: 3,
    image_url: player3,
    player_name: "Xai"
  }
];

// const fetchInterface = () => {
//   for (const cursor of contractABI.contracts) {
//     const match = cursor.abi.find(
//       (jCursor) => jCursor.name === "lutte::models::player::PlayableCharacter"
//     );
//     if (match) {
//       return match; // Return the matching `jCursor`
//     }
//   }
//   return null; // Return null if no match is found
// };

const fetchInterface = (name: string) => {
  const result = contractABI.contracts.find((cursor) =>
    cursor.abi.some((jCursor) => jCursor.name === name)
  );

  if (!result) throw new Error("Interface not found!");

  // Extract the matching object
  const match = result.abi.find((jCursor) => jCursor.name === name);

  return match?.members || [];
};

const mapToTsType = (type: string): string => {
  switch (type) {
    case "core::integer::u8":
    case "core::integer::u32":
      return "number";
    case "core::bool":
      return "boolean";
    case "core::byte_array::ByteArray":
      return "ByteArray"; // Use the previously defined ByteArray interface
    default:
      return "any"; // Fallback for unknown types
  }
};

const generateInterface = (members: any[]): string => {
  return members
    .map((member) => {
      const tsType = mapToTsType(member.type);
      return `  ${member.name}: ${tsType};`;
    })
    .join("\n");
};

const generateInterfaceFromABI = (name: string): string => {
  const members = fetchInterface(name);
  if (!members) throw new Error(`No members found for ${name}`);

  return `interface ${name} {\n${generateInterface(members)}\n}`;
};

const members = fetchInterface("lutte::models::player::PlayableCharacter");

interface PlayableCharacter {
  generateInterface(members);
}
const interfaceString = `interface PlayableCharacter {\n${generateInterface(
  members
)}\n}`;

console.log(interfaceString);

const SelectCharacter = () => {
  // const contract = useContractInstance();

  const [data, setData] = useState<CallContractResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  let [error, setError] = useState();
  // const [isSuccess, setIsSuccess] = useState(false);
  const { account } = useAccount();

  useEffect(() => {
    account
      ?.callContract({
        contractAddress: CONTRACT_ADDRESS,
        entrypoint: "fetch_playable_characters",
        calldata: []
      })
      .then((response) => {
        setIsLoading(false);
        setData(response);
        console.log("==== data fetched ====");
        console.log(response);
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error);
        console.log("==== error fetching ====");
        console.log(error);
      });
  }, []);

  // const { data, isLoading, error, isSuccess } = useCall({
  //   abi: contractABI.world.abi,
  //   address: CONTRACT_ADDRESS,
  //   functionName: "fetch_playable_characters",
  //   args: [],
  //   watch: true // Automatically re-fetch on changes
  // });

  // isSuccess && console.log("suxcce");

  // if (isLoading) {
  //   return (
  //     <div className="spinner">
  //       <div className="loading">Loading...</div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="error">
  //       <p>Error fetching characters: {error}</p>
  //     </div>
  //   );
  // }

  const characters = (data || []).map((char: any, index: number) => ({
    id: index + 1,
    image_url: char?.image_url || player_array[index].image_url, // Placeholder if no image URL
    player_name: char?.name || `Player ${index + 1}`
  }));

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
            <div className="loading">.</div>
          </div>
        ) : error ? (
          // Error Message
          <div className="error">
            <p>Error fetching characters: {error}</p>
          </div>
        ) : (
          // Render Characters
          <div className="__player_boxed flex flex-row justify-evenly max-w-[1024px] gap-4 hover:cursor-pointer">
            {characters.map((player: any) => (
              <div
                key={player.id}
                className="__selectable_player player_card flex"
              >
                <img
                  className="border-black border-4"
                  src={player.image_url}
                  alt={player.player_name}
                />
              </div>
            ))}
          </div>
        )}
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
