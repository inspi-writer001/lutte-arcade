// import { Assets, Texture } from "pixi.js";
// import { useEffect, useRef, useState } from "react";
// import { useTick, Stage } from "@pixi/react";

// export function BunnySprite() {
//   // The Pixi.js `Sprite`
//   const spriteRef = useRef(null);

//   const [texture, setTexture] = useState(Texture.EMPTY);
//   const [isHovered, setIsHover] = useState(false);
//   const [isActive, setIsActive] = useState(false);

//   // Preload the sprite if it hasn't been loaded yet
//   useEffect(() => {
//     if (texture === Texture.EMPTY) {
//       Assets.load(
//         "https://bronze-petite-viper-118.mypinata.cloud/ipfs/bafybeiat7hd3l7jlm3fau6vngeo7hogfzbrzwuomebfzoxjr2e7nxqumly/idlesprite.png"
//       ).then((result) => {
//         setTexture(result);
//       });
//     }
//   }, [texture]);

//   return (
//     <pixiSprite
//       ref={spriteRef}
//       anchor={0.5}
//       eventMode={"static"}
//       onClick={(event) => setIsActive(!isActive)}
//       onPointerOver={(event) => setIsHover(true)}
//       onPointerOut={(event) => setIsHover(false)}
//       scale={isActive ? 0.2 : 1.5}
//       texture={texture}
//       x={100}
//       y={100}
//     />
//   );
// }

import { Assets, Texture, Spritesheet, AnimatedSprite } from "pixi.js";
import React, { useEffect, useRef, useState } from "react";

interface IEntity {
  png: string;
  json: string;
}
interface ICharacter {
  idle: IEntity;
  attack: IEntity;
  hit: IEntity;
  dash: IEntity;
  dodge: IEntity;
}

export interface IBunnySprite {
  textures: Texture[];
}

export const BunnySprite: React.FC<IBunnySprite> = ({ textures }) => {
  // The Pixi.js `Sprite`
  // const [textures, setTextures] = useState<Texture[]>([]);
  const spriteRef = useRef<AnimatedSprite>(null);
  const [isLoop, seIsLoop] = useState(true);
  const [isHovered, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

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
    if (textures.length <= 3) {
      seIsLoop(false);
    }
  }, [textures]);

  if (textures.length === 0) {
    console.log("no texure lengthh");
    return null; // Avoid rendering before data is ready
  }

  return (
    // <></>
    <pixiAnimatedSprite
      ref={spriteRef}
      anchor={0.03}
      eventMode={"static"}
      onClick={() => setIsActive(!isActive)}
      onPointerOver={() => setIsHover(true)}
      onPointerOut={() => setIsHover(false)}
      scale={0.6}
      textures={textures}
      animationSpeed={0.1}
      loop={isLoop}
      x={20}
      y={100}
    />
  );
};
