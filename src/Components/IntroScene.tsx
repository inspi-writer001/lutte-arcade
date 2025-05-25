import { useEffect, useRef, useState } from "react";
// import TransitionOverlay from "./TransitionOverlay";

const scenes = [
  { src: "/introscene/1.png", startTime: 0 },
  { src: "/introscene/2.png", startTime: 6 },
  { src: "/introscene/3.png", startTime: 10 },
  { src: "/introscene/4.png", startTime: 16 },
  { src: "/introscene/5.png", startTime: 25 },
  { src: "/introscene/6.png", startTime: 31 }
];

const IntroScene = ({ onFinish }: { onFinish: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play();

    const interval = setInterval(() => {
      const nextIndex = [...scenes]
        .reverse()
        .findIndex((scene) => audio.currentTime >= scene.startTime);

      const correctedIndex =
        nextIndex !== -1 ? scenes.length - 1 - nextIndex : currentIndex;
      if (correctedIndex !== currentIndex) {
        setCurrentIndex(correctedIndex);
      }

      if (audio.ended) {
        clearInterval(interval);
        onFinish();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [currentIndex, onFinish]);

  const handleSkip = () => {
    audioRef.current?.pause();
    onFinish();
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-black relative overflow-hidden">
      {/* Image Layers */}
      <div className="absolute inset-0 w-full h-full">
        {scenes.map((scene, index) => (
          <img
            key={index}
            src={scene.src}
            alt={`Scene ${index}`}
            className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100 z-30" : "opacity-0 z-10"
            }`}
          />
        ))}
      </div>

      {/* Audio */}
      <audio ref={audioRef} src="/introscene/intro.mp3" preload="auto" />

      {/* Skip Button */}
      <h1
        className="absolute pirata-one font-bold text-4xl top-20 right-25 hover:cursor-pointer bg-gray-950 py-3 px-6 rounded-md text-center z-50"
        onClick={handleSkip}
      >
        Skip Intro
      </h1>
    </div>
  );
};

export default IntroScene;
