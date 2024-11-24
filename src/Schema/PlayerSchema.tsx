// import contractABI from "../manifest_dev.json";

// import { init, SchemaType } from "@dojoengine/sdk";

// export const fetchInterface = (name: string) => {
//   const result = contractABI.contracts.find((cursor) =>
//     cursor.abi.some((jCursor) => jCursor.name === name)
//   );

//   if (!result) throw new Error("Interface not found!");

//   // Extract the matching object
//   const match = result.abi.find((jCursor) => jCursor.name === name);

//   return match?.members || [];
// };

// const parseByteArray = (value: string): any => {
//   // Parse ByteArray structure (adjust as per your needs)
//   return {
//     data: [value], // Assuming the input is a single string
//     pending_word: "0x0",
//     pending_word_len: 0
//   };
// };

// const parseValueByType = (value: string, type: string): any => {
//   switch (type) {
//     case "core::integer::u8":
//     case "core::integer::u32":
//       return parseInt(value, 16); // Convert hex to number
//     case "core::bool":
//       return value === "0x1"; // Convert to boolean
//     case "core::byte_array::ByteArray":
//       return parseByteArray(value); // Convert to ByteArray structure
//     default:
//       return value; // Default: raw value
//   }
// };

// export const mapDataToStructure = (data: string[], members: any[]): any => {
//   if (!Array.isArray(data)) {
//     throw new Error("Invalid data format. Expected an array.");
//   }

//   const mappedData: any = {};
//   members.forEach((member, index) => {
//     const { name, type } = member;

//     // Map each field based on its type
//     mappedData[name] = parseValueByType(data[index], type);
//   });

//   return mappedData;
// };
