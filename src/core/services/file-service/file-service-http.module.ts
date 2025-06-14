import axios, { AxiosInstance } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

import { FILE_SERVER_HTTP_CONFIG, FILE_SERVER_INSTANCE } from 'src/configuration';

@Global()
@Module({
  providers: [
    {
      provide: FILE_SERVER_INSTANCE,
      useFactory: (): AxiosInstance => {
        return axios.create(FILE_SERVER_HTTP_CONFIG);
      },
    },
    {
      provide: HttpService,
      useFactory: (axiosInstance: AxiosInstance) => {
        return new HttpService(axiosInstance);
      },
      inject: [FILE_SERVER_INSTANCE],
    },
  ],
  exports: [HttpService],
})
export class FileServiceHttpModule {}
