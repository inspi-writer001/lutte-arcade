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
  const spriteRef = useRef<AnimatedSprite>(null);
  const prevMovement = useRef<string | null>(null);

  useEffect(() => {
    if (!spriteRef.current || textures.length === 0) return;

    const sprite = spriteRef.current;

    if (prevMovement.current !== playerMovement) {
      sprite.loop = playerMovement === "idle";
      sprite.gotoAndPlay(0); // Restart animation
      prevMovement.current = playerMovement;

      console.log("✅ Movement changed:", playerMovement);
    }
  }, [playerMovement, textures]);

  return (
    <pixiAnimatedSprite
      ref={spriteRef}
      anchor={0.03}
      eventMode={"static"}
      scale={0.6}
      animationSpeed={0.1}
      textures={textures} // ✔️ Ensure the right frames are rendered
      loop={playerMovement === "idle"}
      onComplete={() => {
        if (spriteRef.current && playerMovement !== "idle") {
          spriteRef.current.stop();
        }
      }}
      x={20}
      y={100}
    />
  );
};

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
