'use server';

import {
  deleteFileByURL,
  getPublicFileURL,
} from '@/app/lib/server/objectStorage/awsRequests';
import getHash from '@/app/lib/utils/getStringHash';
import getUserId from '@/app/lib/getUserId';

export async function uploadImage(directoryName: string, image: Blob) {
  return await getPublicFileURL(
    getHash((await getUserId()) + Date().toString()),
    directoryName,
    image,
  );
}

export async function deleteImage(fileURL: string) {
  return await deleteFileByURL(fileURL);
}
