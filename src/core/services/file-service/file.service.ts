import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { first, firstValueFrom } from 'rxjs';

import {
  UploadFileOutputDto,
  UploadImageOutputDto,
  UploadVideoOutputDto,
} from './dtos';

@Injectable()
export class FileService {
  private fileServerUrl = 'http://localhost:3004';
  private uploadImagesUrl = `${this.fileServerUrl}/api/images/upload`;
  private uploadVideosUrl = `${this.fileServerUrl}/api/videos/upload`;
  private uploadFilesUrl = `${this.fileServerUrl}/api/files/upload`;

  constructor(private readonly httpService: HttpService) {}

  async uploadFile(file: File) {
    try {
      const respose = await firstValueFrom(
        this.httpService.post(this.uploadFilesUrl, {
          file,
        })
      )

      return (respose.data as {
        filePath: string;
      });
    } catch {
      return null;
    }
  }

    async uploadVideo(video: File) {
    try {
      const respose = await firstValueFrom(
        this.httpService.post(this.uploadVideosUrl, {
          video,
        })
      )

      return (respose.data as {
        filePath: string;
      });
    } catch {
      return null;
    }
  }

    async uploadImage(image: File) {
    try {
      const respose = await firstValueFrom(
        this.httpService.post(this.uploadImagesUrl, {
          image,
        })
      )

      return (respose.data as {
        filePath: string;
      });
    } catch {
      return null;
    }
  }
}
