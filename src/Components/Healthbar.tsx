import { FC } from "react";
// Import all health bar images manually
import health1 from "../assets/healthbar/1.png";
import health2 from "../assets/healthbar/2.png";
import health3 from "../assets/healthbar/3.png";
import health4 from "../assets/healthbar/4.png";
import health5 from "../assets/healthbar/5.png";
import health6 from "../assets/healthbar/6.png";
import health7 from "../assets/healthbar/7.png";
import health8 from "../assets/healthbar/8.png";
import health9 from "../assets/healthbar/9.png";
import health10 from "../assets/healthbar/10.png";
import health11 from "../assets/healthbar/11.png";
import health12 from "../assets/healthbar/12.png";
import health13 from "../assets/healthbar/13.png";

// Store images in an array
const healthImages = [
  health1,
  health2,
  health3,
  health4,
  health5,
  health6,
  health7,
  health8,
  health9,
  health10,
  health11,
  health12,
  health13
];

interface IHealthBar {
  percentage: number;
}

const HealthBar: FC<IHealthBar> = ({ percentage }) => {
  const getHealthImage = (health: number) => {
    const index = Math.max(
      0,
      Math.min(12, Math.floor((1 - health / 100) * 12))
    ); // Map 100%-0% to 0-12
    return healthImages[index];
  };

  return (
    <div>
      <img
        src={getHealthImage(percentage)}
        alt="Health bar"
        style={{ width: "350px", height: "80px" }}
      />
    </div>
  );
};

export default HealthBar;
