import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function generateClientFormToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashClientFormToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyClientFormToken(token: string, expectedHash: string): boolean {
  const actual = hashClientFormToken(token);
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
