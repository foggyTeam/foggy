import 'server-only';
import { S3 } from 'aws-sdk';

const s3 = new S3({
  endpoint: 'https://storage.yandexcloud.net',
  region: 'ru-central1',
  accessKeyId: process.env.YANDEX_STORAGE_KEY_ID as string,
  secretAccessKey: process.env.YANDEX_STORAGE_KEY as string,
  signatureVersion: 'v4',
});

export default s3;
