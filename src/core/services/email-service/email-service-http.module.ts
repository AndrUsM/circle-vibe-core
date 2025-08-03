import axios, { AxiosInstance } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

import { EMAIL_SERVER_HTTP_CONFIG, EMAIL_SERVER_INSTANCE } from 'src/configuration';

@Global()
@Module({
  providers: [
    {
      provide: EMAIL_SERVER_INSTANCE,
      useFactory: (): AxiosInstance => {
        return axios.create(EMAIL_SERVER_HTTP_CONFIG);
      },
    },
    {
      provide: HttpService,
      useFactory: (axiosInstance: AxiosInstance) => {
        return new HttpService(axiosInstance);
      },
      inject: [EMAIL_SERVER_INSTANCE],
    },
  ],
  exports: [HttpService],
})
export class EmailServiceHttpModule {}
