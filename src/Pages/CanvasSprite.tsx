import React, { useRef, useEffect, useState } from "react";

interface FrameData {
  width: number;
  height: number;
  steps: number;
  fps: number;
}

interface SpriteProps {
  playerSprite: string;
  enemySprite: string;
  playerMovement: string;
  enemyMovement: string;
  isEnemyMovingForward: boolean;
  isPlayerMovingForward: boolean;
  playerFrameData: Record<string, FrameData>;
  enemyFrameData: Record<string, FrameData>;
  onAnimationComplete: (character: "player" | "enemy") => void;
}

const CanvasSprite: React.FC<SpriteProps> = ({
  playerSprite,
  enemySprite,
  playerMovement,
  enemyMovement,
  isEnemyMovingForward,
  isPlayerMovingForward,
  playerFrameData,
  enemyFrameData,
  onAnimationComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerSpriteRef = useRef<HTMLImageElement>(new Image());
  const enemySpriteRef = useRef<HTMLImageElement>(new Image());
  const playerFrameIndexRef = useRef<number>(0);
  const enemyFrameIndexRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const prevPlayerMovementRef = useRef<string>(playerMovement);
  const prevEnemyMovementRef = useRef<string>(enemyMovement);

  // State to manage positions
  const [playerX, setPlayerX] = useState<number>(0);
  const [enemyX, setEnemyX] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const playerSpriteImg = playerSpriteRef.current;
    const enemySpriteImg = enemySpriteRef.current;
    playerSpriteImg.src = playerSprite;
    enemySpriteImg.src = enemySprite;

    const playerData =
      playerFrameData[playerMovement] || playerFrameData["idle"];
    const enemyData = enemyFrameData[enemyMovement] || enemyFrameData["idle"];

    const playerFrameDuration = 1000 / playerData.fps;
    const enemyFrameDuration = 1000 / enemyData.fps;

    // Calculate padding and initial positions
    const paddingX = canvas.width * -0.13; // some amount of padding
    const initialPlayerX = paddingX;
    const initialEnemyX = canvas.width - enemyData.width * 0.5 - paddingX;

    // Set initial positions
    setPlayerX(initialPlayerX);
    setEnemyX(initialEnemyX);

    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed > Math.min(playerFrameDuration, enemyFrameDuration)) {
        lastFrameTimeRef.current = timestamp;

        // Preserve the frame index when switching animations
        if (prevPlayerMovementRef.current !== playerMovement) {
          playerFrameIndexRef.current = Math.max(
            playerFrameIndexRef.current - 1,
            0
          );
          prevPlayerMovementRef.current = playerMovement;
        } else {
          playerFrameIndexRef.current =
            (playerFrameIndexRef.current + 1) % playerData.steps;
        }

        if (prevEnemyMovementRef.current !== enemyMovement) {
          enemyFrameIndexRef.current = Math.max(
            enemyFrameIndexRef.current - 1,
            0
          );
          prevEnemyMovementRef.current = enemyMovement;
        } else {
          enemyFrameIndexRef.current =
            (enemyFrameIndexRef.current + 1) % enemyData.steps;
        }

        // Check if animations are complete
        if (playerFrameIndexRef.current === 0) onAnimationComplete("player");
        if (enemyFrameIndexRef.current === 0) onAnimationComplete("enemy");

        // Update positions if moving forward
        if (isPlayerMovingForward) {
          setPlayerX((prevX) =>
            Math.min(prevX + 5, canvas.width / 2 - playerData.width * 0.25)
          );
        }
        if (isEnemyMovingForward) {
          setEnemyX((prevX) =>
            Math.max(prevX - 5, canvas.width / 2 + enemyData.width * 0.25)
          );
        }
      }

      // Clear previous sprite frames (not entire canvas)
      ctx.clearRect(
        playerX,
        0,
        playerData.width * 0.5,
        playerData.height * 0.5
      );
      ctx.clearRect(enemyX, 0, enemyData.width * 0.5, enemyData.height * 0.5);

      // Draw player
      ctx.drawImage(
        playerSpriteImg,
        playerFrameIndexRef.current * playerData.width,
        0,
        playerData.width,
        playerData.height,
        playerX,
        0,
        playerData.width * 0.5,
        playerData.height * 0.5
      );

      // Draw enemy
      ctx.drawImage(
        enemySpriteImg,
        enemyFrameIndexRef.current * enemyData.width,
        0,
        enemyData.width,
        enemyData.height,
        enemyX,
        0,
        enemyData.width * 0.5,
        enemyData.height * 0.5
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    playerSpriteImg.onload = enemySpriteImg.onload = () => {
      animationFrameId = requestAnimationFrame(animate);
    };

    return () => cancelAnimationFrame(animationFrameId);
  }, [
    playerSprite,
    enemySprite,
    playerMovement,
    enemyMovement,
    isEnemyMovingForward,
    isPlayerMovingForward,
    playerFrameData,
    enemyFrameData,
    onAnimationComplete
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={1024}
      height={500}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        marginTop: "calc(10vh + 5vw)"
      }}
    />
  );
};

export default CanvasSprite;
