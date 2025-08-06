import { registerAs } from '@nestjs/config';

export const minioConfig = registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT, 10) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'devuser',
  secretKey: process.env.MINIO_SECRET_KEY || 'devpassword123',
  bucketName: process.env.MINIO_BUCKET_NAME || 'gestion-emballages-dev',
}));