import { CreateAxiosDefaults } from 'axios';
import { FILE_SERVER_URL } from './file-server-url';

export const FILE_SERVER_HTTP_CONFIG: CreateAxiosDefaults = {
  timeout: 10_000,
  maxRedirects: 5,
  baseURL: FILE_SERVER_URL,
};
