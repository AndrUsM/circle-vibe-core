import { Injectable } from '@nestjs/common';
import randomstring from 'randomstring';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { GenerateJwtTokenInput } from '../dtos';
import { JWT_TOKEN_SECRET } from '../../../configuration';

@Injectable()
export class UserAuthService {
  generateRandomToken(payload: Record<string, unknown>): string {
    const secret = randomstring.generate({
      length: 20,
      readable: false,
    });

    return jwt.sign(payload, secret);
  }

  encryptPassword(password: string): string {
    const bcryptSalt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, bcryptSalt);
  }

  comparePasswords(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  decryptPassword(password: string): string {
    const bcryptSalt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, bcryptSalt);
  }

  generateJwtToken = ({ id, email, secret }: GenerateJwtTokenInput): string => {
    return jwt.sign({ _id: id, email }, secret ?? JWT_TOKEN_SECRET, {
      expiresIn: '1d',
    });
  };

  generatePrivateKey(payload: Record<string, unknown>): string {
    const secret = randomstring.generate({
      length: 20,
      readable: true,
      charset: 'numeric',
    });

    return jwt.sign(payload, secret);
  }
}
