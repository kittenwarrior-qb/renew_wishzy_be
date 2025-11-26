import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendVerificationEmail(email: string, token: string, fullName: string) {
    try {
      const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/verify-email?token=${token}`;

      const result = await this.resend.emails.send({
        from: `Wishzy <${this.configService.get<string>('MAIL_FROM')}>`,
        to: [email],
        subject: 'Verify Your Email - Wishzy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Wishzy, ${fullName}!</h2>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This link will expire in 24 hours. If you didn't create an account, please ignore this email.
            </p>
          </div>
        `,
      });

      console.log('Verification email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email: string, token: string, fullName: string) {
    try {
      const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password?token=${token}`;

      const result = await this.resend.emails.send({
        from: `Wishzy <${this.configService.get<string>('MAIL_FROM')}>`,
        to: [email],
        subject: 'Reset Your Password - Wishzy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${fullName},</h2>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2196F3; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
        `,
      });

      console.log('Password reset email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendCertificateEmail(
    email: string,
    fullName: string,
    courseName: string,
    certificateUrl: string,
    certificateImageUrl?: string,
  ) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      let finalCertificateUrl = certificateUrl;
      if (!certificateUrl.startsWith(frontendUrl)) {
        const enrollmentId = certificateUrl.split('/certificates/')[1];
        if (enrollmentId) {
          finalCertificateUrl = `${frontendUrl}/certificates/${enrollmentId}`;
        }
      }

      const result = await this.resend.emails.send({
        from: `Wishzy <${this.configService.get<string>('MAIL_FROM')}>`,
        to: [email],
        subject: `Chúc mừng! Bạn đã hoàn thành khóa học ${courseName} - Wishzy`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">🎉 Chúc mừng ${fullName}!</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              Bạn đã hoàn thành xuất sắc khóa học: <strong>${courseName}</strong>
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Chứng chỉ của bạn đã sẵn sàng!
            </p>
            
            ${
              certificateImageUrl
                ? `
              <div style="margin: 30px 0; text-align: center;">
                <img src="${certificateImageUrl}" 
                     alt="Certificate" 
                     style="max-width: 100%; height: auto; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
              </div>
            `
                : ''
            }
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${finalCertificateUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 32px; 
                        text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Xem chứng chỉ
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Hoặc copy link này vào trình duyệt:
            </p>
            <p style="word-break: break-all; color: #2196F3; font-size: 14px;">${finalCertificateUrl}</p>
            
            <p style="margin-top: 30px; font-size: 16px; line-height: 1.6;">
              Tiếp tục học tập và khám phá thêm nhiều khóa học thú vị trên Wishzy!
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Chứng chỉ này là minh chứng cho sự nỗ lực và cống hiến của bạn.
            </p>
          </div>
        `,
      });

      console.log('Certificate email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send certificate email:', error);
      throw new Error(`Failed to send certificate email: ${error.message}`);
    }
  }
}
