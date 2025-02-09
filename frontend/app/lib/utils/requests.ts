import axios, { AxiosRequestConfig } from 'axios';

const apiUri = process.env.NEXT_PUBLIC_API_URI;
const verificationKey = process.env.VERIFICATION_KEY;

// fetcher accepts relative request's url.
export const getRequest: any = (url: string) =>
  axios
    .get(`${apiUri}/${url}`, {
      headers: {
        'x-api-key': `${verificationKey}`,
      },
    } as AxiosRequestConfig)
    .then((response) => {
      return response.data;
    })
    .catch((e) => console.log(`error: ${e}`));

// poster accepts relative request's url.
export const postRequest: any = async (url: string, data: any) => {
  return await axios
    .post(`${apiUri}/${url}`, data, {
      headers: {
        'x-api-key': `${verificationKey}`,
      },
    } as AxiosRequestConfig)
    .then((data) => {
      return data.data;
    })
    .catch((data) => {
      return data.response.data;
    });
};
