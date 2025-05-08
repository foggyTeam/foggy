'use server';

import {
  deleteFileByURL,
  getPublicFileURL,
} from '@/app/lib/server/objectStorage/awsRequests';
import getHash from '@/app/lib/utils/getStringHash';

export async function uploadImage(
  id: string,
  directoryName: string,
  image: Blob,
) {
  return await getPublicFileURL(
    getHash(id + Date().toString()),
    directoryName,
    image,
  );
}

export async function deleteImage(fileURL: string) {
  return await deleteFileByURL(fileURL);
}
