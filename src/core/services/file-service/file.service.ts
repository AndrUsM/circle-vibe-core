import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import {
  UploadFileOutputDto,
  UploadImageOutputDto,
  UploadVideoOutputDto,
} from '@circle-vibe/shared';
import { MessageFileEntityType } from '@prisma/client';
import { FILE_SERVER_CONVERSATIONS_BUCKET, FILE_SERVER_URL } from 'src/configuration';

@Injectable()
export class FileService {
  private uploadImagesUrl = 'images/upload';
  private uploadVideosUrl = 'videos/upload';
  private uploadFilesUrl = 'files/upload';

  constructor(private readonly httpService: HttpService) {}

  composeFileUrl(urlWithHostname: string) {
    return urlWithHostname ? `${FILE_SERVER_URL}${urlWithHostname}?bucket=${FILE_SERVER_CONVERSATIONS_BUCKET}` : null;
  }

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

  async deleteFile(
    type: MessageFileEntityType,
    fileUrlWithoutHostname: string,
  ) {
    if (!fileUrlWithoutHostname) {
      return null;
    }

    const fileName = fileUrlWithoutHostname.split('/').pop();

    try {
      if (!type) {
        return null;
      }

      if (type === MessageFileEntityType.FILE) {
        const response = await this.httpService.axiosRef.delete(
          `${this.uploadFilesUrl}/${fileName}`,
        );
        return response.data;
      }

      if (type === MessageFileEntityType.IMAGE) {
        const response = await this.httpService.axiosRef.delete(
          `${this.uploadImagesUrl}/${fileName}`,
        );
        return response.data;
      }

      const response = await this.httpService.axiosRef.delete(
        `${this.uploadVideo}/${fileUrlWithoutHostname}`,
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async uploadVideo(video: File): Promise<UploadVideoOutputDto | null> {
    const payload = new FormData();
    payload.append('video', video);

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
    payload.append('image', image);

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
