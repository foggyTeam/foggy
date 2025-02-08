import axios, { AxiosRequestConfig } from 'axios';

const apiUri = process.env.NEXT_PUBLIC_API_URI;

// fetcher accepts relative request's url.
export const getRequest: any = (url: string) =>
  axios
    .get(`${apiUri}/${url}`, {
      headers: {
        'X-API-KEY': process.env.VERIFICATION_KEY,
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
        'X-API-KEY': process.env.VERIFICATION_KEY,
      },
    } as AxiosRequestConfig)
    .then((data) => {
      return data.data;
    })
    .catch((data) => {
      return data.response.data;
    });
};
