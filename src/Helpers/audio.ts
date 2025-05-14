import bg_music from "/audio/bgmusic.mp3";
import attack_1 from "/audio/bloodyattack1.mp3";
import attack_2 from "/audio/bloodyattack2.mp3";
import attack_3 from "/audio/bloodyattack3.mp3";
import dodge from "/audio/dodge.mp3";
import death from "/audio/death2.mp3";

const playSound = (src: string) => {
  const audio = new Audio(src);
  audio.volume = 0.8;
  audio.play();
};

export { bg_music, attack_1, attack_2, attack_3, death, dodge, playSound };
