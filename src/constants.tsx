import manifest from "./manifest_release.json";

const CONTRACT_ADDRESS = manifest.contracts[0].address;

const RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet";
const WORLD_ADDRESS = manifest.world.address;
const TORII_URL = "https://api.cartridge.gg/x/lutte-arcade-mainnet/torii";

// const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";

// const TORII_URL = "https://api.cartridge.gg/x/lutte-arcade-testne/torii";

// const TORII_URL = "https://api.cartridge.gg/x/lutte-arcade-sepol/torii";

// const TORII_URL = "http://127.0.0.1:8080/torii";

export { CONTRACT_ADDRESS, RPC_URL, WORLD_ADDRESS, TORII_URL };
