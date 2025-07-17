import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

import {
  PBKDF2_ITERATIONS,
  TAG_LENGTH,
  IV_LENGTH,
  DIGEST,
  SALT_LENGTH,
  ALGORITHM,
  KEY_LENGTH,
} from '@circle-vibe/shared';

@Injectable()
export class SecurityService {
  /**
   * Encrypts a given string using AES-256-CBC with a randomly generated
   * salt, IV, and authentication tag.
   *
   * The output format is a base64-encoded string of the following format:
   *
   *   salt (16 bytes) + IV (16 bytes) + tag (16 bytes) + encrypted
   *
   * @param text The string to encrypt.
   * @param password The password to use for encryption.
   * @returns The encrypted string.
   */
  encrypt(text: string, password: string): string {
    const salt = crypto.randomBytes(TAG_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    const key = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      DIGEST,
    );

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    // Output format: salt + iv + tag + encrypted
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }

  /**
   * Decrypts a given string using AES-256-CBC and a given password.
   * The input is expected to be a base64-encoded string of the following format:
   *
   *   salt (16 bytes) + IV (16 bytes) + tag (16 bytes) + encrypted
   *
   * @param encryptedBase64 The string to decrypt (base64-encoded).
   * @param password The password to use for decryption.
   * @returns The decrypted string.
   */
  decrypt(encryptedBase64: string, password: string): string {
    const data = Buffer.from(encryptedBase64, 'base64');

    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = data.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH,
    );
    const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      DIGEST,
    );

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted =
      decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');

    return decrypted;
  }
}
