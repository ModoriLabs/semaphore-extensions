import type { BigNumberish } from "ethers"

/**
 * Converts a string number to a 0x-prefixed hex string with padding
 * @param value The value to convert
 * @param padding The padding length (default: 64)
 * @returns The formatted hex string
 */
export const toHex = (value: BigNumberish | string | number, padding = 64): string =>
    `0x${BigInt(value).toString(16).padStart(padding, "0")}`
