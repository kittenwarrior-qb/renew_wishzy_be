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

  // Resolution priority from highest to lowest
  private readonly resolutionPriority = ['1080p', '720p', '480p', '360p', '240p'];

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.bunnyUrl = this.configService.get<string>('BUNNY_URL');
    this.bunnyApiKey = this.configService.get<string>('BUNNY_API_KEY');
    this.bunnyLibraryId = this.configService.get<string>('BUNNY_LIBRARY_ID');
    this.bunnyCdnHostname = this.configService.get<string>('BUNNY_CDN_HOSTNAME');
  }

  /**
   * Get the best available resolution URL for a video
   * Falls back to lower resolutions if higher ones aren't available
   */
  private getBestVideoUrl(videoId: string, availableResolutions?: string[]): string {
    const baseUrl = `https://${this.bunnyCdnHostname}/${videoId}`;

    // If no resolutions info, default to trying 720p then fallback pattern
    if (!availableResolutions || availableResolutions.length === 0) {
      // Return 720p as default, frontend should handle fallback
      return `${baseUrl}/play_720p.mp4`;
    }

    // Find the best available resolution
    for (const res of this.resolutionPriority) {
      if (availableResolutions.includes(res)) {
        return `${baseUrl}/play_${res}.mp4`;
      }
    }

    // If none of our priority resolutions match, use the first available
    if (availableResolutions.length > 0) {
      return `${baseUrl}/play_${availableResolutions[0]}.mp4`;
    }

    // Ultimate fallback
    return `${baseUrl}/play_720p.mp4`;
  }

  /**
   * Build video sources object with all available resolutions
   */
  private buildVideoSources(
    videoId: string,
    availableResolutions?: string[],
  ): Record<string, string> {
    const baseUrl = `https://${this.bunnyCdnHostname}/${videoId}`;
    const sources: Record<string, string> = {};

    if (availableResolutions && availableResolutions.length > 0) {
      for (const res of availableResolutions) {
        sources[res] = `${baseUrl}/play_${res}.mp4`;
      }
    } else {
      // Default sources if no info available
      sources['720p'] = `${baseUrl}/play_720p.mp4`;
      sources['480p'] = `${baseUrl}/play_480p.mp4`;
      sources['360p'] = `${baseUrl}/play_360p.mp4`;
    }

    return sources;
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

      // Try to get video info to retrieve duration and available resolutions
      let duration = 0;
      let availableResolutions: string[] = [];
      try {
        // Wait a bit for video processing to start
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const videoInfo = await this.getVideoInfo(videoId);
        duration = videoInfo.duration || 0;
        availableResolutions = videoInfo.availableResolutions || [];
      } catch (error) {
        console.warn('Could not fetch video info immediately:', error.message);
      }

      const videoUrl = this.getBestVideoUrl(videoId, availableResolutions);
      const videoSources = this.buildVideoSources(videoId, availableResolutions);

      return {
        videoId: videoId,
        url: videoUrl,
        videoUrl: videoUrl,
        thumbnailUrl: `https://${this.bunnyCdnHostname}/${videoId}/thumbnail.jpg`,
        iframeUrl: `https://iframe.mediadelivery.net/embed/${this.bunnyLibraryId}/${videoId}`,
        duration: duration,
        availableResolutions: availableResolutions,
        videoSources: videoSources,
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
      const availableResolutions = videoData.availableResolutions
        ? videoData.availableResolutions
            .split(',')
            .map((r: string) => r.trim())
            .filter(Boolean)
        : [];

      const videoUrl = this.getBestVideoUrl(videoData.guid, availableResolutions);
      const videoSources = this.buildVideoSources(videoData.guid, availableResolutions);

      return {
        videoId: videoData.guid,
        title: videoData.title,
        duration: videoData.length,
        status: videoData.status,
        thumbnailUrl: videoData.thumbnailFileName
          ? `https://${this.bunnyCdnHostname}/${videoData.guid}/${videoData.thumbnailFileName}`
          : null,
        videoUrl: videoUrl,
        iframeUrl: `https://iframe.mediadelivery.net/embed/${this.bunnyLibraryId}/${videoData.guid}`,
        availableResolutions: availableResolutions,
        videoSources: videoSources,
      };
    } catch (error) {
      console.error('Bunny get video error:', error.response?.data || error.message);
      throw new BadRequestException(
        `Failed to get video info from Bunny.net: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}
