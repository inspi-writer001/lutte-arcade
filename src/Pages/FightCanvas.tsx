import { useEffect, useRef } from "react";

interface SpriteData {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  fps: number;
  loop: boolean;
}

interface FightCanvasProps {
  playerSprite: string;
  enemySprite: string;
  playerMovement: "idle" | "dash" | "attack" | "dead" | "hit" | "dodge";
  enemyMovement: "idle" | "dash" | "attack" | "dead" | "hit" | "dodge";
  playerFrameData: {
    idle: { width: number; height: number; steps: number; fps: number };
    attack: { width: number; height: number; steps: number; fps: number };
    dash: { width: number; height: number; steps: number; fps: number };
    hit: { width: number; height: number; steps: number; fps: number };
    dodge: { width: number; height: number; steps: number; fps: number };
  };
  enemyFrameData: {
    idle: { width: number; height: number; steps: number; fps: number };
    attack: { width: number; height: number; steps: number; fps: number };
    dash: { width: number; height: number; steps: number; fps: number };
    hit: { width: number; height: number; steps: number; fps: number };
    dodge: { width: number; height: number; steps: number; fps: number };
  };
  onAnimationComplete?: (type: "player" | "enemy") => void;
  isPlayerMovingForward?: boolean;
  isEnemyMovingForward?: boolean;
}

function FightCanvas({
  playerSprite,
  enemySprite,
  playerMovement,
  enemyMovement,
  playerFrameData,
  enemyFrameData,
  onAnimationComplete,
  isPlayerMovingForward = false,
  isEnemyMovingForward = false
}: FightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const enemyImageRef = useRef<HTMLImageElement | null>(null);
  const animationIdRef = useRef<number>(0);
  const playerFrameRef = useRef(0);
  const enemyFrameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const playerTimeAccumulatorRef = useRef(0);
  const enemyTimeAccumulatorRef = useRef(0);

  // Initial positions
  const playerPositionRef = useRef({ x: 0, baseX: 0 });
  const enemyPositionRef = useRef({ x: 0, baseX: 0 });

  // Create and setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size the canvas to fit its container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;

        // Set initial positions
        playerPositionRef.current = {
          x: canvas.width * 0.15,
          baseX: canvas.width * 0.15
        };
        enemyPositionRef.current = {
          x: canvas.width * 0.65,
          baseX: canvas.width * 0.65
        };
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Load images
    playerImageRef.current = new Image();
    enemyImageRef.current = new Image();

    playerImageRef.current.src = playerSprite;
    enemyImageRef.current.src = enemySprite;

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  // Update sprites when movement types change
  useEffect(() => {
    if (!playerImageRef.current) return;
    playerImageRef.current.src = playerSprite;
    playerFrameRef.current = 0;
  }, [playerSprite]);

  useEffect(() => {
    if (!enemyImageRef.current) return;
    enemyImageRef.current.src = enemySprite;
    enemyFrameRef.current = 0;
  }, [enemySprite]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return;

    playerFrameRef.current = 0;
    enemyFrameRef.current = 0;
    lastFrameTimeRef.current = 0;

    const getFrameData = (type: "player" | "enemy", movement: string) => {
      const data = type === "player" ? playerFrameData : enemyFrameData;
      return data[movement as keyof typeof data];
    };

    const playerData = getFrameData("player", playerMovement);
    const enemyData = getFrameData("enemy", enemyMovement);

    let playerAnimComplete = false;
    let enemyAnimComplete = false;

    const animate = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const playerImage = playerImageRef.current;
      const enemyImage = enemyImageRef.current;

      if (!playerImage || !enemyImage) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate time delta
      // const deltaTime = timestamp - (lastFrameTimeRef.current || timestamp);
      // lastFrameTimeRef.current = timestamp;

      const deltaTime = timestamp - (lastFrameTimeRef.current || timestamp);
      lastFrameTimeRef.current = timestamp;

      // Accumulate time for player animation
      playerTimeAccumulatorRef.current += deltaTime;
      if (
        playerTimeAccumulatorRef.current >= 1000 / playerData.fps &&
        !playerAnimComplete
      ) {
        playerFrameRef.current =
          (playerFrameRef.current + 1) % playerData.steps;
        playerTimeAccumulatorRef.current = 0; // Reset accumulator

        console.log("Player frame advanced to:", playerFrameRef.current);

        if (
          playerFrameRef.current >= playerData.steps - 1 &&
          playerMovement !== "idle"
        ) {
          playerAnimComplete = true;
          onAnimationComplete?.("player");
        }
      }

      enemyTimeAccumulatorRef.current += deltaTime;
      if (
        enemyTimeAccumulatorRef.current >= 1000 / enemyData.fps &&
        !enemyAnimComplete
      ) {
        enemyFrameRef.current = (enemyFrameRef.current + 1) % enemyData.steps;
        enemyTimeAccumulatorRef.current = 0; // Reset accumulator

        console.log("Enemy frame advanced to:", enemyFrameRef.current);

        if (
          enemyFrameRef.current >= enemyData.steps - 1 &&
          enemyMovement !== "idle"
        ) {
          enemyAnimComplete = true;
          onAnimationComplete?.("enemy");
        }
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Handle movement animations
      if (isPlayerMovingForward) {
        const targetX = canvas.width * 0.4;
        playerPositionRef.current.x = Math.min(
          playerPositionRef.current.x + deltaTime * 0.5,
          targetX
        );

        if (
          playerPositionRef.current.x >= targetX &&
          playerMovement === "dash"
        ) {
          onAnimationComplete?.("player");
        }
      } else if (
        playerMovement === "idle" &&
        playerPositionRef.current.x !== playerPositionRef.current.baseX
      ) {
        // Move back to original position
        playerPositionRef.current.x = Math.max(
          playerPositionRef.current.x - deltaTime * 0.5,
          playerPositionRef.current.baseX
        );
      }

      if (isEnemyMovingForward) {
        const targetX = canvas.width * 0.4;
        enemyPositionRef.current.x = Math.max(
          enemyPositionRef.current.x - deltaTime * 0.5,
          targetX
        );

        if (enemyPositionRef.current.x <= targetX && enemyMovement === "dash") {
          onAnimationComplete?.("enemy");
        }
      } else if (
        enemyMovement === "idle" &&
        enemyPositionRef.current.x !== enemyPositionRef.current.baseX
      ) {
        // Move back to original position
        enemyPositionRef.current.x = Math.min(
          enemyPositionRef.current.x + deltaTime * 0.5,
          enemyPositionRef.current.baseX
        );
      }

      // Update player frame
      if (deltaTime >= 1000 / playerData.fps && !playerAnimComplete) {
        playerFrameRef.current++;

        if (playerFrameRef.current >= playerData.steps) {
          if (playerMovement !== "idle") {
            playerAnimComplete = true;
            onAnimationComplete?.("player");
          }
          playerFrameRef.current =
            playerMovement === "idle" ? 0 : playerData.steps - 1;
        }
      }

      // Update enemy frame
      if (deltaTime >= 1000 / enemyData.fps && !enemyAnimComplete) {
        enemyFrameRef.current++;

        if (enemyFrameRef.current >= enemyData.steps) {
          if (enemyMovement !== "idle") {
            enemyAnimComplete = true;
            onAnimationComplete?.("enemy");
          }
          enemyFrameRef.current =
            enemyMovement === "idle" ? 0 : enemyData.steps - 1;
        }
      }

      // Draw player
      const playerFrame = playerFrameRef.current;
      const playerRow = Math.floor(playerFrame / 3);
      const playerCol = playerFrame % 3;

      ctx.drawImage(
        playerImage,
        playerCol * playerData.width,
        playerRow * playerData.height,
        playerData.width,
        playerData.height,
        playerPositionRef.current.x - playerData.width * 0.25, // Center sprite
        canvas.height * 0.5 - playerData.height * 0.25,
        playerData.width * 0.5,
        playerData.height * 0.5
      );

      // Draw enemy (flipped)
      const enemyFrame = enemyFrameRef.current;
      const enemyRow = Math.floor(enemyFrame / 3);
      const enemyCol = enemyFrame % 3;

      ctx.save();
      ctx.scale(-1, 1); // Flip horizontally
      ctx.drawImage(
        enemyImage,
        enemyCol * enemyData.width,
        enemyRow * enemyData.height,
        enemyData.width,
        enemyData.height,
        -enemyPositionRef.current.x - enemyData.width * 0.25, // Adjust for flipping
        canvas.height * 0.5 - enemyData.height * 0.25,
        enemyData.width * 0.5,
        enemyData.height * 0.5
      );
      ctx.restore();

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [
    playerMovement,
    enemyMovement,
    playerSprite,
    enemySprite,
    isPlayerMovingForward,
    isEnemyMovingForward
  ]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default FightCanvas;
