import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCanvas } from 'canvas';

@Injectable()
export class CertificateService {
  constructor(private readonly configService: ConfigService) {}

  generateCertificateUrl(enrollmentId: string, origin?: string): string {
    const frontendUrl = origin || this.configService.get<string>('FRONTEND_URL');
    return `${frontendUrl}/certificates/${enrollmentId}`;
  }

  private wrapText(
    ctx: any,
    text: string,
    maxWidth: number,
  ): { lines: string[]; totalHeight: number } {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return { lines, totalHeight: lines.length * 45 };
  }

  async generateCertificateImage(
    studentName: string,
    courseName: string,
    completionDate: string,
  ): Promise<Buffer> {
    const width = 1188;
    const height = 840;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.antialias = 'subpixel';
    ctx.patternQuality = 'best';
    ctx.quality = 'best';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    const cornerSize = 60;
    const cornerOffset = 20;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(cornerOffset, cornerOffset + cornerSize);
    ctx.lineTo(cornerOffset, cornerOffset);
    ctx.lineTo(cornerOffset + cornerSize, cornerOffset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - cornerOffset - cornerSize, cornerOffset);
    ctx.lineTo(width - cornerOffset, cornerOffset);
    ctx.lineTo(width - cornerOffset, cornerOffset + cornerSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cornerOffset, height - cornerOffset - cornerSize);
    ctx.lineTo(cornerOffset, height - cornerOffset);
    ctx.lineTo(cornerOffset + cornerSize, height - cornerOffset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - cornerOffset - cornerSize, height - cornerOffset);
    ctx.lineTo(width - cornerOffset, height - cornerOffset);
    ctx.lineTo(width - cornerOffset, height - cornerOffset - cornerSize);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.fillText('CHỨNG NHẬN', width / 2, 150);

    ctx.fillStyle = '#4b5563';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('Chứng nhận rằng', width / 2, 240);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 46px Arial, sans-serif';
    ctx.fillText(studentName, width / 2, 320);

    ctx.fillStyle = '#4b5563';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('đã hoàn thành xuất sắc khóa học', width / 2, 390);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px Arial, sans-serif';

    const maxWidth = width - 240;
    const { lines } = this.wrapText(ctx, courseName, maxWidth);

    let courseNameY = 470;
    if (lines.length > 1) {
      courseNameY = 450;
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, courseNameY + index * 45);
    });

    const dateY = courseNameY + lines.length * 45 + 60;
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(`Hoàn thành vào ngày ${completionDate}`, width / 2, dateY);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('Wishzy', width / 2, height - 100);

    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('Nền tảng học trực tuyến hàng đầu', width / 2, height - 65);

    return canvas.toBuffer('image/png', { compressionLevel: 6 });
  }
}
