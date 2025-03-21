import React, { useEffect, useRef, useState } from "react";

interface SpriteAnimatorProps {
  image: string;
  widthFrame: number;
  heightFrame: number;
  steps: number;
  fps: number;
  loop: boolean;
  autoplay?: boolean;
  direction?: "forward" | "backward";
  style?: React.CSSProperties;
  className?: string;
  onComplete?: () => void;
}

const SpriteAnimator: React.FC<SpriteAnimatorProps> = ({
  image,
  widthFrame,
  heightFrame,
  steps,
  fps,
  loop,
  autoplay = true,
  direction = "forward",
  style,
  className,
  onComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const frameRef = useRef<number>(direction === "forward" ? 0 : steps - 1);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const completedCycleRef = useRef<boolean>(false);

  // Load the image
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
      // Reset animation when image changes
      frameRef.current = direction === "forward" ? 0 : steps - 1;
      completedCycleRef.current = false;

      // Draw the first frame immediately to avoid blank canvas
      drawFrame();
    };

    return () => {
      img.onload = null;
    };
  }, [image, direction, steps]);

  // Draw the current frame
  const drawFrame = () => {
    if (canvasRef.current && imageRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, widthFrame, heightFrame);

        // Calculate the position in the spritesheet
        const frameX = frameRef.current * widthFrame;

        // Draw the current frame
        ctx.drawImage(
          imageRef.current,
          frameX,
          0,
          widthFrame,
          heightFrame,
          0,
          0,
          widthFrame,
          heightFrame
        );
      }
    }
  };

  // Animation loop
  const animate = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }

    const deltaTime = time - previousTimeRef.current;
    const interval = 1000 / fps;

    if (deltaTime >= interval) {
      // Draw the current frame
      drawFrame();

      // Update frame count
      if (direction === "forward") {
        frameRef.current = (frameRef.current + 1) % steps;

        // Handle completion of animation
        if (frameRef.current === 0) {
          completedCycleRef.current = true;
          if (!loop) {
            // For non-looping animations, draw the last frame before stopping
            frameRef.current = steps - 1;
            drawFrame();
            cancelAnimationFrame(requestRef.current!);
            if (onComplete) onComplete();
            return;
          }
        }
      } else {
        // Backward direction
        frameRef.current = frameRef.current - 1;
        if (frameRef.current < 0) {
          frameRef.current = steps - 1;
          completedCycleRef.current = true;
          if (!loop) {
            // For non-looping animations, draw the first frame before stopping
            frameRef.current = 0;
            drawFrame();
            cancelAnimationFrame(requestRef.current!);
            if (onComplete) onComplete();
            return;
          }
        }
      }

      previousTimeRef.current = time - (deltaTime % interval);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  // Start/stop animation based on autoplay and when image changes
  useEffect(() => {
    if (isLoaded && autoplay) {
      // Draw first frame before starting animation
      drawFrame();
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isLoaded, autoplay, image, fps, loop, steps, direction]);

  // Apply proper CSS to make the canvas responsive while maintaining aspect ratio
  const canvasStyle: React.CSSProperties = {
    ...style,
    maxWidth: "100%",
    objectFit: "contain"
  };

  return (
    <canvas
      ref={canvasRef}
      width={widthFrame}
      height={heightFrame}
      className={className}
      style={canvasStyle}
    />
  );
};

export default SpriteAnimator;
