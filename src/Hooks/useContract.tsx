import { Abi, useContract } from "@starknet-react/core";
import contractABI from "../manifest_dev.json";
import { CONTRACT_ADDRESS } from "../constants";

export const useContractInstance = () => {
  const { contract } = useContract({
    abi: contractABI.world.abi as Abi,
    address: CONTRACT_ADDRESS
  });

  return contract;
};
