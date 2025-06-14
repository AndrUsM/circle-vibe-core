import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

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
    try {
      const respose = await this.httpService.axiosRef.post(
        this.uploadFilesUrl,
        { file },
      );

      return respose.data;
    } catch {
      return null;
    }
  }

  async uploadVideo(video: File): Promise<UploadVideoOutputDto | null> {
    try {
      const respose = await this.httpService.axiosRef.post(
        this.uploadVideosUrl,
        { video},
      );

      return respose.data;
    } catch {
      return null;
    }
  }

  async uploadImage(image: File): Promise<UploadImageOutputDto | null> {
    try {
      const respose = await this.httpService.axiosRef.post(
        this.uploadImagesUrl,
        { image },
      );

      return respose.data;
    } catch {
      return null;
    }
  }
}
