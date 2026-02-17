'use server';

import {
  deleteFileByURL,
  getPublicFileURL,
} from '@/app/lib/server/objectStorage/awsRequests';
import getHash, { getRandomString } from '@/app/lib/utils/getStringHash';
import getUserId from '@/app/lib/getUserId';

type NameConfig = {
  type: 'hash' | 'random';
  base?: string;
};

export async function uploadImage(
  directoryName: string,
  image: Blob | string,
  prefix: string = '',
  nameConfig: NameConfig = {
    type: 'hash',
  },
) {
  let name =
    prefix +
    (nameConfig.type === 'hash'
      ? getHash(nameConfig.base || (await getUserId()) + Date().toString())
      : getRandomString());
  return await getPublicFileURL(name, directoryName, image as Blob);
}

export async function deleteImage(fileURL: string) {
  return await deleteFileByURL(fileURL);
}
