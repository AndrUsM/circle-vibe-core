import { CreateAxiosDefaults } from 'axios';
import { EMAIL_SERVER_URL } from './email-server-url';

export const EMAIL_SERVER_HTTP_CONFIG: CreateAxiosDefaults = {
  timeout: 10_000,
  maxRedirects: 5,
  baseURL: EMAIL_SERVER_URL,
};
