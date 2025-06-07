import 'server-only';
import axios from 'axios';
import s3 from '@/app/lib/server/objectStorage/awsClient';

axios.interceptors.request.use(
  (config) => {
    // Логируем URL
    console.log('AXIOS REQUEST URL:', config.url);

    // Логируем метод и все заголовки
    console.log('AXIOS METHOD:', config.method);
    console.log('AXIOS HEADERS:', config.headers);

    // Логируем body (осторожно, если там большие файлы!)
    if (config.data) {
      if (config.data instanceof Buffer) {
        console.log('AXIOS BODY: <Buffer: length', config.data.length, '>');
      } else if (config.data instanceof ArrayBuffer) {
        console.log(
          'AXIOS BODY: <ArrayBuffer: byteLength',
          config.data.byteLength,
          '>',
        );
      } else {
        console.log('AXIOS BODY:', config.data);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const bucketName = 'foggy';

export const getPublicFileURL = async (
  fileName: string,
  directoryName: string,
  file: Blob,
) => {
  const fileType = file.type;
  const key = `${directoryName}/${fileName}.${fileType.split('/')[1]}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
    Expires: 60,
    ACL: 'public-read',
  };

  try {
    const uploadURL = await s3.getSignedUrlPromise('putObject', params);

    console.log('Текущее время сервера (UTC):', new Date().toISOString());
    console.log('Локальное время сервера:', new Date().toString());
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const response = await axios.put(uploadURL, fileBuffer, {
      headers: {
        'Content-Type': fileType,
        'x-amz-acl': 'public-read',
      },
    });

    if (response.status === 200)
      return { url: `${s3.endpoint.href}${bucketName}/${key}` };
    else return { error: response.statusText };
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
};

export const deleteFileByURL = async (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const key = parsedUrl.pathname.substring(bucketName.length + 2);

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    const result = await s3.deleteObject(params).promise();
    if (result.$response.error)
      return { error: result.$response.error.message };
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
};
