export function padHexTo66(hexString: string): string {
  if (!hexString.startsWith("0x")) {
    throw new Error("Invalid hex string: must start with '0x'");
  }

  const withoutPrefix = hexString.slice(2); // Remove "0x"
  const currentLength = withoutPrefix.length;

  // If already 64 characters (excluding "0x"), return as is
  if (currentLength === 64) {
    return hexString;
  }

  // If it's longer than 64 characters (excluding "0x"), trim it
  if (currentLength > 64) {
    return "0x" + withoutPrefix.slice(0, 64);
  }

  // If shorter than 64, pad with leading zeros
  return "0x" + withoutPrefix.padStart(64, "0");
}
