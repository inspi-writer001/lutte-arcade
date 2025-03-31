import { Texture, AnimatedSprite } from "pixi.js";
import React, { useEffect, useRef } from "react";

export interface IBunnySprite {
  textures: Texture[];
  playerMovement: string;
}

export const BunnySprite: React.FC<IBunnySprite> = ({
  textures,
  playerMovement
}) => {
  // The Pixi.js `Sprite`
  // const [textures, setTextures] = useState<Texture[]>([]);
  const spriteRef = useRef<AnimatedSprite>(null);

  // useEffect(() => {
  //   const loadSpritesheet = async () => {
  //     try {
  //       console.log("Loading spritesheet JSON...");

  //       const response = await fetch(
  //         "https://bronze-petite-viper-118.mypinata.cloud/ipfs/bafybeichnzxccu3soohoozv7de3futyxlbc4tljmtulal7fwomvw2a3shu/spritesheet.json"
  //       );
  //       const spritesheetData = await response.json();
  //       // const spritesheetData = await Assets.load(
  //       //   "https://bronze-petite-viper-118.mypinata.cloud/ipfs/bafybeichnzxccu3soohoozv7de3futyxlbc4tljmtulal7fwomvw2a3shu/spritesheet.json"
  //       // );

  //       if (!spritesheetData.frames) {
  //         throw new Error("Invalid spritesheet: 'frames' key missing.");
  //       }

  //       console.log("Loading spritesheet texture...");
  //       const texture = await Assets.load(
  //         "https://bronze-petite-viper-118.mypinata.cloud/ipfs/bafybeichnzxccu3soohoozv7de3futyxlbc4tljmtulal7fwomvw2a3shu/spritesheet.png"
  //       );

  //       console.log("Creating Spritesheet instance...");
  //       const spritesheet = new Spritesheet(texture, spritesheetData);

  //       console.log("Parsing spritesheet...");
  //       await spritesheet.parse(); // ✅ Ensure it's fully parsed before using

  //       console.log("Extracting animation textures...");
  //       const animationTextures = Object.keys(spritesheetData.frames).map(
  //         (frameName) => spritesheet.textures[frameName]
  //       );

  //       if (animationTextures.length === 0) {
  //         throw new Error("No frames found in spritesheet.");
  //       }

  //       console.log("Textures loaded:", animationTextures);
  //       setTextures(animationTextures);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error loading spritesheet:", error);
  //     }
  //   };

  //   loadSpritesheet();
  // }, []);
  // Ensure animation plays when textures are ready
  useEffect(() => {
    if (spriteRef.current && textures.length > 0) {
      spriteRef.current.play();
    }
  }, [textures]);

  if (textures.length === 0) {
    console.log("no texture length");
    return null; // Avoid rendering before data is ready
  }

  return (
    // <></>
    <pixiAnimatedSprite
      ref={spriteRef}
      anchor={0.03}
      eventMode={"static"}
      scale={0.6}
      textures={textures}
      animationSpeed={0.1}
      loop={playerMovement === "idle"}
      onComplete={() => {
        if (playerMovement !== "idle") {
          spriteRef.current?.stop();
        }
      }}
      x={20}
      y={100}
    />
  );
};
