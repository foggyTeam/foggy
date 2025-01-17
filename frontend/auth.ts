import NextAuth, { AuthError } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createSession } from '@/app/lib/session';
import { postRequest } from '@/app/lib/utils/requests';
import Google from 'next-auth/providers/google';
import { Provider } from 'next-auth/providers';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        register: {
          label: 'Are you new to foggy?',
          placeholder: "Leave this field empty if you aren't",
          type: 'text',
        },
      },
      authorize: async (credentials: any) => {
        const request = credentials.register
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

        if (result.error) throw new AuthError(result.error);

        // 3. create user session
        const user = {
          email: credentials.email,
          nickname: 'hoggyfoggy0',
          id: '123456qwrewa125dt',
        };

        await createSession(user.id);

        return {};
      },
    }),
    Google,
    {
      id: 'yandex',
      name: 'Yandex',
      type: 'oauth',
      wellKnown: 'https://oauth.yandex.com/.well-known/openid-configuration',
      authorization: {
        url: 'https://oauth.yandex.com/authorize',
        params: { scope: 'login:email login:info', response_type: 'code' },
      },
      token: 'https://oauth.yandex.com/token',
      userinfo: 'https://login.yandex.ru/info',
      clientId: process.env.YANDEX_CLIENT_ID,
      clientSecret: process.env.YANDEX_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.real_name,
          email: profile.default_email,
        };
      },
    } as Provider,
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/${url}`;
    },
  },
  events: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account.provider === 'google' || account.provider === 'yandex') {
        /*
        const request = credentials.register
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
        

        if (result.error) throw new AuthError(result.error);*/

        await createSession(user.id);
      }
    },

    async error(message) {
      console.error('Error event:', message);
    },
  } as any,
});
