// Import all red button images
import redButton0 from "../assets/action_buttons/redattack0.png";
import redButton1 from "../assets/action_buttons/redattack1.png";
import redButton2 from "../assets/action_buttons/redattack2.png";

// Import all green button images
import greenButton0 from "../assets/action_buttons/greenattack0.png";
import greenButton1 from "../assets/action_buttons/greenattack1.png";
import greenButton2 from "../assets/action_buttons/greenattack2.png";

// Import all blue button images
import blueButton0 from "../assets/action_buttons/blueattack0.png";
import blueButton1 from "../assets/action_buttons/blueattack1.png";
import blueButton2 from "../assets/action_buttons/blueattack2.png";

// Import other action buttons
import block from "../assets/action_buttons/block.png";
import dodge from "../assets/action_buttons/dodge.png";
import specialAttack from "../assets/action_buttons/specialattack.png";

// Group them into arrays
const red_buttons = [redButton0, redButton1, redButton2];
const green_buttons = [greenButton0, greenButton1, greenButton2];
const blue_buttons = [blueButton0, blueButton1, blueButton2];

// Additional buttons
const other_buttons = { block, dodge, specialAttack };

// Export the arrays for use in other components if needed
export { red_buttons, green_buttons, blue_buttons, other_buttons };
