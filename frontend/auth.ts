import NextAuth, { Account, CredentialsSignin, Profile, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createSession } from '@/app/lib/session';
import { postRequest } from '@/app/lib/utils/requests';
import Google from 'next-auth/providers/google';
import { Provider } from 'next-auth/providers';
import userStore from '@/app/stores/userStore';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        register: {
          label: 'Are you new to foggy?',
          placeholder: "Leave this field empty if you aren't",
          type: 'string',
        },
      },
      authorize: async (credentials: any) => {
        const request = credentials.register
          ? {
              url: 'users/register',
              data: {
                email: credentials.email,
                password: credentials.password,
              },
            }
          : {
              url: 'users/login',
              data: {
                email: credentials.email,
                password: credentials.password,
              },
            };

        const result = await postRequest(request.url, request.data);

        if (result.errors || !result) {
          const errorMessage =
            result.errors?.email && credentials.register
              ? result.errors.email
              : undefined;
          throw new CredentialsSignin(errorMessage);
        }

        // 3. create user session
        const user: User = {
          id: result.id,
          email: result.email,
          name: result.nickname,
        };

        await createSession(user.id);
        userStore.setUser(user);
        // 4. return user
        return user;
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
      profile(profile: Profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
        };
      },
    } as Provider,
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  events: {
    async signIn({ user, account }: { user: User; account: Account }) {
      if (account.provider === 'google' || account.provider === 'yandex') {
        if (!user || !account) throw new CredentialsSignin();
        const request = {
          url: 'users/google-login',
          data: {
            id: user.id,
            nickname: user.name,
            email: user.email,
          },
        };

        const result = await postRequest(request.url, request.data);

        if (result.errors || !result || !user)
          throw new CredentialsSignin(result.errors);

        await createSession(user.id as string);

        userStore.setUser({ ...user, name: result.nickname });

        return { ...user, name: result.nickname };
      }
    },

    async error(message: string) {
      console.error('Error event:', message);
    },
  } as any,
  pages: {
    signIn: '/login',
  },
});
