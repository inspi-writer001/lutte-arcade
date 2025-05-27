import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback
} from "react";
import { bg_music } from "../Helpers/audio";

const BackgroundMusic = forwardRef((_, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.loop = true;
        audio.volume = 0.3;
        await audio.play();
        setIsPlaying(true);
        // setNeedsUserInteraction(false);
      } catch (err) {
        if (err instanceof Error && err.name === "NotAllowedError") {
          // setNeedsUserInteraction(true);
        }
        console.warn("Audio playback failed:", err);
      }
    }
  }, []);

  const stopMusic = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    playMusic: attemptPlay,
    stopMusic: stopMusic
  }));

  const handleUserClick = () => {
    !isPlaying ? attemptPlay() : stopMusic();
  };

  return (
    <>
      <audio ref={audioRef} src={bg_music} preload="auto" />
      {
        <button
          className="music_button"
          onClick={handleUserClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: "absolute",
            top: "30dvh",
            right: "100px",
            height: "50px",
            width: isHovered ? "160px" : "50px",
            backgroundColor: "white",
            color: "#333",
            border: "none",
            borderRadius: "25px",
            cursor: "pointer",
            zIndex: "1000",
            display: "flex",
            alignItems: "center",
            justifySelf: "left",
            justifyContent: isHovered ? "flex-start" : "center",
            paddingLeft: isHovered ? "15px" : "0",
            paddingRight: isHovered ? "15px" : "0",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow:
              "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
            fontSize: "16px",
            fontWeight: "500",
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}
        >
          <span
            style={{
              fontSize: "20px",
              marginRight: isHovered ? "8px" : "0",
              transition: "margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              flexShrink: 0 // Prevent emoji from shrinking
            }}
          >
            🎵
          </span>
          {isHovered && (
            <span
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? "translateX(0)" : "translateX(-10px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              {isPlaying ? "Disable Music" : "Enable Music"}
            </span>
          )}
        </button>
      }
    </>
  );
});

BackgroundMusic.displayName = "BackgroundMusic";

export default BackgroundMusic;
