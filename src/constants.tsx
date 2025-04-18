import manifest from "./manifest_dev.json";

const CONTRACT_ADDRESS = manifest.contracts[0].address;

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const WORLD_ADDRESS = manifest.world.address;

// const TORII_URL = "https://api.cartridge.gg/x/lutte-arcade-testne/torii";

const TORII_URL = "https://api.cartridge.gg/x/lutte-arcade-sepol/torii";

export { CONTRACT_ADDRESS, RPC_URL, WORLD_ADDRESS, TORII_URL };
