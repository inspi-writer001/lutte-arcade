declare module "react-responsive-spritesheet" {
  import { Component } from "react";

  interface SpritesheetProps {
    getInstance?: (spritesheet: any) => void;
    image: string;
    widthFrame: number;
    heightFrame: number;
    steps: number;
    fps: number;
    autoplay?: boolean;
    loop?: boolean;
    style?: React.CSSProperties;
    direction?: "forward" | "rewind";
  }

  export default class Spritesheet extends Component<SpritesheetProps> {}
}
