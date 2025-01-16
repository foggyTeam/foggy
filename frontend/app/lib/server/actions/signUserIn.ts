'use server';

import { postRequest } from '@/app/lib/utils/requests';
import { createSession } from '@/app/lib/session';

export async function signUserIn(credentials, register: boolean = false) {
  // 1. client checks form errors / done

  // 2. server checks database errors
  const request = register
    ? {
        url: 'users/register',
        data: {
          nickname: 'user1',
          email: credentials.email,
          password: credentials.password,
        },
      }
    : {
        url: 'users/login',
        data: {
          userIdentifier: credentials.email,
          password: credentials.password,
        },
      };

  const result = await postRequest(request.url, request.data);

  if (result.error) throw new Error(result.error);

  // 3. create user session
  const user = {
    email: credentials.email,
    nickname: 'hoggyfoggy0',
    id: '123456qwrewa125dt',
  };
  await createSession(user.id);

  // 4. redirect user
  return;
}
