/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, Method } from "axios";
import { tokenClientSession } from "./session";

export class HttpError extends Error {
  status: number;
  payload: any;
  constructor({
    payload,
    status,
    message,
  }: {
    status: number;
    payload: any;
    message?: string;
  }) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

axios.interceptors.request.use(
  (config) => {
    if (config.skipAuth) return config; // bỏ qua auth nếu cần
    const token = tokenClientSession.getValue();
    if (token) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);
axios.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);
async function request<Response>(
  method: Method,
  url: string,
  options?: AxiosRequestConfig<any>
): Promise<Response> {
  try {
    const skipAuth = options?.skipAuth ?? false;
    const baseUrl = options?.baseURL;
    const fullUrl = url.startsWith("/")
      ? `${baseUrl}${url}`
      : `${baseUrl}/${url}`;
    const baseHeaders = {
      "Content-Type": "application/json",
    };
    
    // Get token for authenticated requests
    const token = !skipAuth ? localStorage.getItem('token') : null;
    
    const response = await axios({
      method: method,
      url: fullUrl,
      data: options?.data,
      params: options?.params,
      skipAuth: skipAuth,
      headers: {
        ...baseHeaders,
        ...options?.headers,
        ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new HttpError({
        payload: error.response.data,
        status: error.response.status,
        message: error.response.data?.message || error.message,
      });
    }
    throw error;
  }
}

const http = {
  get: <Response>(
    url: string,
    options?: Omit<AxiosRequestConfig<any>, "data"> | undefined
  ) => {
    return request<Response>("GET", url, options);
  },
  put: <Response>(
    url: string,
    data: any,
    options?: Omit<AxiosRequestConfig<any>, "data"> | undefined
  ) => {
    return request<Response>("PUT", url, {
      ...options,
      data,
    });
  },
  post: <Response>(
    url: string,
    data: any,
    options?: Omit<AxiosRequestConfig<any>, "data"> | undefined
  ) => {
    return request<Response>("POST", url, {
      ...options,
      data,
    });
  },
  delete: <Response>(
    url: string,
    data?: any | undefined,
    options?: Omit<AxiosRequestConfig<any>, "data"> | undefined
  ) => {
    return request<Response>("DELETE", url, {
      ...options,
      data: data,
    });
  },
};
export default http;
