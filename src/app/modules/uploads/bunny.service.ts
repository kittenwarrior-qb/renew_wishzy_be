import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BunnyService {
  private readonly bunnyUrl: string;
  private readonly bunnyApiKey: string;
  private readonly bunnyLibraryId: string;
  private readonly bunnyCdnHostname: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.bunnyUrl = this.configService.get<string>('BUNNY_URL');
    this.bunnyApiKey = this.configService.get<string>('BUNNY_API_KEY');
    this.bunnyLibraryId = this.configService.get<string>('BUNNY_LIBRARY_ID');
    this.bunnyCdnHostname = this.configService.get<string>('BUNNY_CDN_HOSTNAME');
  }

  async uploadVideo(file: Express.Multer.File): Promise<any> {
    try {
      const createVideoResponse = await firstValueFrom(
        this.httpService.post(
          `${this.bunnyUrl}/library/${this.bunnyLibraryId}/videos`,
          {
            title: new Date(),
          },
          {
            headers: {
              AccessKey: this.bunnyApiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const videoId = createVideoResponse.data.guid;

      await firstValueFrom(
        this.httpService.put(
          `${this.bunnyUrl}/library/${this.bunnyLibraryId}/videos/${videoId}`,
          file.buffer,
          {
            headers: {
              AccessKey: this.bunnyApiKey,
              'Content-Type': 'application/octet-stream',
            },
          },
        ),
      );

      // Try to get video info to retrieve duration (may not be available immediately)
      let duration = 0;
      try {
        // Wait a bit for video processing to start
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const videoInfo = await this.getVideoInfo(videoId);
        duration = videoInfo.duration || 0;
      } catch (error) {
        console.warn('Could not fetch video duration immediately:', error.message);
        // Duration will be 0, frontend should handle this
      }

      return {
        videoId: videoId,
        url: `https://${this.bunnyCdnHostname}/${videoId}/play_720p.mp4`,
        videoUrl: `https://${this.bunnyCdnHostname}/${videoId}/play_720p.mp4`,
        thumbnailUrl: `https://${this.bunnyCdnHostname}/${videoId}/thumbnail.jpg`,
        iframeUrl: `https://iframe.mediadelivery.net/embed/${this.bunnyLibraryId}/${videoId}`,
        duration: duration,
      };
    } catch (error) {
      console.error('Bunny upload error:', error.response?.data || error.message);
      throw new BadRequestException(
        `Failed to upload video to Bunny.net: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async deleteVideo(videoId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.bunnyUrl}/library/${this.bunnyLibraryId}/videos/${videoId}`,
          {
            headers: {
              AccessKey: this.bunnyApiKey,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.error('Bunny delete error:', error.response?.data || error.message);
      throw new BadRequestException(
        `Failed to delete video from Bunny.net: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getVideoInfo(videoId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.bunnyUrl}/library/${this.bunnyLibraryId}/videos/${videoId}`, {
          headers: {
            AccessKey: this.bunnyApiKey,
          },
        }),
      );

      const videoData = response.data;

      return {
        videoId: videoData.guid,
        title: videoData.title,
        duration: videoData.length,
        status: videoData.status,
        thumbnailUrl: videoData.thumbnailFileName
          ? `https://${this.bunnyCdnHostname}/${videoData.guid}/${videoData.thumbnailFileName}`
          : null,
        videoUrl: `https://${this.bunnyCdnHostname}/${videoData.guid}/play_720p.mp4`,
        iframeUrl: `https://iframe.mediadelivery.net/embed/${this.bunnyLibraryId}/${videoData.guid}`,
        availableResolutions: videoData.availableResolutions || [],
      };
    } catch (error) {
      console.error('Bunny get video error:', error.response?.data || error.message);
      throw new BadRequestException(
        `Failed to get video info from Bunny.net: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}
