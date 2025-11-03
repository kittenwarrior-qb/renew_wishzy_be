import { VNPay, HashAlgorithm } from 'vnpay';

export const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE!,
  secureSecret: process.env.VNP_SECRET!,
  vnpayHost: process.env.VNP_HOST!,
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,
  enableLog: true,
});
