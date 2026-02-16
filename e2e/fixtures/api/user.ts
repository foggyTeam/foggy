import { postRequest } from './requests';

export async function AuthorizeUser(
  email: string,
  password: string,
): Promise<string | null> {
  const loginUrl = 'users/login';
  const registerUrl = 'users/register';
  const data = {
    email,
    password,
  };
  try {
    const result = await postRequest(loginUrl, data);
    if (result.errors) throw new Error(result.errors);
    return result.id;
  } catch (e: any) {
    console.log(e);
  }

  try {
    const result = await postRequest(registerUrl, data);
    if (result.errors) throw new Error(result.errors);
    return result.id;
  } catch (e: any) {
    console.log(e);
  }
  return null;
}
