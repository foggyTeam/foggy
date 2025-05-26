import 'server-only';
import axios, { AxiosRequestConfig } from 'axios';

const apiUri = process.env.NEXT_PUBLIC_API_URI;
const verificationKey = process.env.VERIFICATION_KEY;

// fetcher accepts relative request's url.
export const getRequest: any = async (
  url: string,
  options: AxiosRequestConfig = {},
) =>
  axios
    .get(`${apiUri}/${url}`, {
      headers: {
        'x-api-key': `${verificationKey}`,
        ...options.headers,
      },
      ...options,
    } as AxiosRequestConfig)
    .then((response) => {
      return response.data;
    })
    .catch((e) => console.error(`error: ${e}`));

// poster accepts relative request's url.
export const postRequest: any = async (
  url: string,
  data: any,
  options: AxiosRequestConfig = {},
) => {
  return await axios
    .post(`${apiUri}/${url}`, data, {
      headers: {
        'x-api-key': `${verificationKey}`,
        ...options.headers,
      },
      ...options,
    } as AxiosRequestConfig)
    .then((data) => {
      return data.data;
    })
    .catch((data) => {
      return data.response.data;
    });
};

export const patchRequest: any = async (
  url: string,
  data: any,
  options: AxiosRequestConfig = {},
) => {
  return await axios
    .patch(`${apiUri}/${url}`, data, {
      headers: {
        'x-api-key': `${verificationKey}`,
        ...options.headers,
      },
      ...options,
    } as AxiosRequestConfig)
    .then((data) => {
      return data.data;
    })
    .catch((data) => {
      return data.response.data;
    });
};

export const deleteRequest: any = async (
  url: string,
  options: AxiosRequestConfig = {},
) => {
  return await axios
    .delete(`${apiUri}/${url}`, {
      headers: {
        'x-api-key': `${verificationKey}`,
        ...options.headers,
      },
      ...options,
    } as AxiosRequestConfig)
    .then((data) => {
      return data.data;
    })
    .catch((data) => {
      return data.response.data;
    });
};