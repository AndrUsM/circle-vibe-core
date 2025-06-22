import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { io } from 'socket.io-client';
import * as fs from 'fs';

import {
  UploadFileOutputDto,
  UploadImageOutputDto,
  UploadVideoOutputDto,
} from './dtos';

@Injectable()
export class FileService {
  private uploadImagesUrl = 'images/upload';
  private uploadVideosUrl = 'videos/upload';
  private uploadFilesUrl = 'files/upload';

  constructor(private readonly httpService: HttpService) {}

  async uploadFile(file: File): Promise<UploadFileOutputDto | null> {
    const payload = new FormData();
    payload.append('file', file);

    try {
      const respose = await this.httpService.axiosRef.post(
        this.uploadFilesUrl,
        payload,
      );

      return respose.data;
    } catch {
      return null;
    }
  }

  async uploadVideo(video: File): Promise<UploadVideoOutputDto | null> {
    const payload = new FormData();
    payload.append('test', video);

    try {
      const respose = await this.httpService.axiosRef.post(
        this.uploadVideosUrl,
        payload,
      );

      return respose.data;
    } catch {
      return null;
    }
  }

  async uploadImage(image: File): Promise<UploadImageOutputDto | null> {
    const payload = new FormData();

    try {
      const respose = await this.httpService.axiosRef.post(
        this.uploadImagesUrl,
        payload,
      );

      return respose.data;
    } catch {
      return null;
    }
  }
}
