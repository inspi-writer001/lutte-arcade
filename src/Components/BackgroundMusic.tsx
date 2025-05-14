import { useRef, useImperativeHandle, forwardRef } from "react";
import { bg_music } from "../Helpers/audio";

const BackgroundMusic = forwardRef((_, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => ({
    playMusic: () => {
      const audio = audioRef.current;
      if (audio) {
        audio.loop = true;
        audio.volume = 0.3;
        audio.play().catch((err) => {
          console.warn("User interaction required for autoplay.", err);
        });
      }
    },
    stopMusic: () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }));

  return <audio ref={audioRef} src={bg_music} />;
});

export default BackgroundMusic;
