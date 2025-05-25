import { HashedTokenParams } from "./hashed-token-data";

export interface ParsedJWT extends HashedTokenParams {
  isExpired: boolean;
  isValid: boolean;
}