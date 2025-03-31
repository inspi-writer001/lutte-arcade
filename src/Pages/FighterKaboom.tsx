import { KaboomCtx } from "kaboom";
import k from "../kaboomCtx";
import { useEffect, useState } from "react";
import { drawTile, fetchMapData } from "../Helpers/utils";

interface FrameData {
  width: number;
  height: number;
  steps: number;
  fps: number;
}

interface FightCanvasProps {
  playerSprite: string;
  enemySprite: string;
  playerMovement: "idle" | "dash" | "attack" | "dead" | "hit" | "dodge";
  enemyMovement: "idle" | "dash" | "attack" | "dead" | "hit" | "dodge";
  playerFrameData: Record<string, FrameData>;
  enemyFrameData: Record<string, FrameData>;
  onAnimationComplete?: (type: "player" | "enemy") => void;
}

function FightCanvas({
  playerSprite,
  enemySprite,
  playerMovement,
  enemyMovement,
  playerFrameData,
  enemyFrameData,
  onAnimationComplete
}: FightCanvasProps) {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [resizedSprites, setResizedSprites] = useState<{
    player: string;
    enemy: string;
  } | null>(null);

  useEffect(() => {
    async function resizeImage(src: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => {
          const maxSize = 2048;
          let { width, height } = img;
          const scaleFactor = Math.min(maxSize / width, maxSize / height, 1);
          width *= scaleFactor;
          height *= scaleFactor;

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas context not available");

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL());
        };
        img.onerror = reject;
      });
    }

    async function preloadAndResizeImages() {
      try {
        const [player, enemy] = await Promise.all([
          resizeImage(playerSprite),
          resizeImage(enemySprite)
        ]);
        setResizedSprites({ player, enemy });
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error loading images", error);
      }
    }

    preloadAndResizeImages();
  }, [playerSprite, enemySprite]);

  useEffect(() => {
    if (!imagesLoaded || !resizedSprites) return;

    k.loadSprite("bg", "./background/fight_bg.png");
    k.loadSprite("player", resizedSprites.player, {
      sliceX: playerFrameData[playerMovement].steps,
      sliceY: 1,
      anims: {
        idle: {
          from: 0,
          to: playerFrameData[playerMovement].steps - 1,
          loop: playerMovement == "idle"
        }
      }
    });

    k.loadSprite("enemy", resizedSprites.enemy, {
      sliceX: enemyFrameData[enemyMovement].steps,
      anims: {
        idle: {
          from: 0,
          to: enemyFrameData[enemyMovement].steps - 1,
          loop: enemyMovement == "idle"
        }
      }
    });

    k.loadSprite("tileset", "./tilesets/Ground_04.png", {
      sliceX: 8,
      sliceY: 8
    });

    const arena = async (k: KaboomCtx) => {
      // k.setGravity(2000);
      k.add([k.sprite("bg"), k.pos(0, 0), k.scale(0.8), k.fixed()]);

      const { layers, tilewidth, tileheight } = await fetchMapData(
        "./maps/arena.json"
      );

      const map = k.add([k.pos(0, 0)]);

      for (const layer of layers) {
        if (layer.name == "SpawnPoints" && layer.type == "objectgroup") {
          for (const object of layer.objects) {
            if (object.name == "player_1") {
              map.add([
                k.sprite("player", { anim: "idle" }),
                k.pos(object.x - 200, object.y + 130),
                k.scale(3),
                k.area({
                  shape: new k.Rect(k.vec2(6), 25, 100)
                }),
                k.anchor("center"),
                k.body(),
                "player"
              ]);
              continue;
            } else if (object.name == "player_2") {
              map.add([
                k.sprite("enemy", { anim: "idle" }),
                k.pos(object.x + 200, object.y + 180),
                k.scale(3),
                k.area({
                  shape: new k.Rect(k.vec2(6), 25, 100)
                }),
                k.anchor("center"),
                k.body(),
                "enemy"
              ]);
            }

            continue;
          }

          // continue;
        }

        if (layer.name == "Boundaries" && layer.type == "objectgroup") {
          // console.log(layer);
          for (const object of layer.objects) {
            map.add([
              k.area({
                shape: new k.Rect(k.vec2(0), object.width, object.height)
              }),
              k.pos(object.x, object.y + tileheight),
              k.body({ isStatic: true })
            ]);
          }
          continue;
        }

        // if (layer.type == "tilelayer") {
        //   drawTile(k, map, layer, tilewidth, tileheight);
        // }
      }

      k.camPos(k.vec2(k.center().x - 450, k.center().y - 160));
      k.camScale(k.vec2(0.8));

      // const player = k.add([k.sprite("player"), k.pos(100, 300), k.scale(2)]);

      // const enemy = k.add([k.sprite("enemy"), k.pos(500, 300), k.scale(2)]);

      // player.play(playerMovement in playerFrameData ? playerMovement : "idle");
      // enemy.play(enemyMovement in enemyFrameData ? enemyMovement : "idle");

      // k.onUpdate(() => {
      //   if (playerMovement === "attack" && onAnimationComplete) {
      //     player.onAnimEnd(() => onAnimationComplete("player"));
      //   }
      //   if (enemyMovement === "attack" && onAnimationComplete) {
      //     enemy.onAnimEnd(() => onAnimationComplete("enemy"));
      //   }
      // });
    };

    k.scene("fight", () => arena(k));

    k.go("fight");
  }, [imagesLoaded, resizedSprites, playerMovement, enemyMovement]);

  return <div id="game" className="w-full h-full" />;
}

export default FightCanvas;
