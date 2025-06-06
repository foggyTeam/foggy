import 'server-only';
import axios from 'axios';
import s3 from '@/app/lib/server/objectStorage/awsClient';

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

  console.log(fileType, key, bucketName);
  try {
    const uploadURL = await s3.getSignedUrlPromise('putObject', params);

    console.log(uploadURL);

    const response = await axios.put(uploadURL, file, {
      headers: {
        'Content-Type': fileType,
        'x-amz-acl': 'public-read',
      },
    });

    if (response.status === 200)
      return { url: `${s3.endpoint.href}${bucketName}/${key}` };
    else return { error: response.statusText };
  } catch (error: any) {
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
