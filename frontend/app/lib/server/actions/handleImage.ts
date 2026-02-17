'use server';

import {
  deleteFileByURL,
  getPrivateFileURL,
  getPublicFileURL,
} from '@/app/lib/server/objectStorage/awsRequests';
import getHash from '@/app/lib/utils/getStringHash';
import getUserId from '@/app/lib/getUserId';

export async function uploadPublicImage(
  directoryName: string,
  image: Blob | string,
) {
  return await getPublicFileURL(
    getHash((await getUserId()) + Date().toString()),
    directoryName,
    image as Blob,
  );
}

export async function uploadPrivateImage(
  hashBase: string,
  directoryName: string,
  image: Blob | string,
) {
  return await getPrivateFileURL(
    getHash(hashBase),
    directoryName,
    image as Blob,
  );
}

export async function deleteImage(fileURL: string) {
  return await deleteFileByURL(fileURL);
}
