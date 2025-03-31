import { GameObj, KaboomCtx } from "kaboom";

const fetchMapData = async (mapFilePath: string): Promise<TiledMap> => {
  const response = await fetch(mapFilePath);
  const data = await response.json();

  return data;
};

const drawTile = async (
  k: KaboomCtx,
  map: GameObj,
  layer: TileLayer,
  tileWidth: number,
  tileHeight: number
) => {
  let no_drawn_tiles = 0;
  const tile_pos = k.vec2(0, 0);

  for (const tile_number of layer.data) {
    if (no_drawn_tiles % layer.width === 0) {
      tile_pos.x = 0;
      tile_pos.y += tileHeight;
    } else {
      tile_pos.x += tileWidth;
    }

    no_drawn_tiles += 1;

    if (tile_number === 0) {
      continue;
    }

    map.add([
      k.sprite("tileset", { frame: tile_number - 1 }),
      k.pos(tile_pos),
      k.offscreen()
      // k.scale(5)
    ]);
  }
};

export { fetchMapData, drawTile };

export type TiledMap = {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: Layer[];
};

type Layer = ObjectLayer | TileLayer;

type ObjectLayer = {
  draworder: string;
  id: number;
  name: string;
  objects: MapObject[];
  opacity: number;
  type: "objectgroup";
  visible: boolean;
  x: number;
  y: number;
};

type MapObject = {
  height: number;
  id: number;
  name: string;
  point: boolean;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
};

type TileLayer = {
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: "tilelayer";
  visible: boolean;
  width: number;
  x: number;
  y: number;
};
