
import type { AxiosResponse } from 'axios';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:9099/api/v1',
    validateStatus: () => true
});

const responseHandler = (response: AxiosResponse<any, any>) => {
    if (!response) return { status: 0, data: null };
    return { status: response.status, data: response.data.data ?? null };
};

const authorization = (accessToken: string | undefined) => {
    return { headers: { Authorization: `Bearer ${accessToken}` } }
};

const api = {
    get: (url: string, accessToken?: string) => axiosInstance.get(url, authorization(accessToken)).then(responseHandler),
    post: (url: string, data: any, accessToken?: string) => axiosInstance.post(url, data, authorization(accessToken)).then(responseHandler),
    put: (url: string, data: any, accessToken?: string) => axiosInstance.put(url, data, authorization(accessToken)).then(responseHandler),
    delete: (url: string, accessToken?: string) => axiosInstance.delete(url, authorization(accessToken)).then(responseHandler),
};

export const endpoints = {
    checkEmail: '/auth/checkEmail',
    checkNickname: '/auth/checkNickname',
    signUp: '/auth/signUp',
    signIn: '/auth/signIn',
    getLoginUser: '/user/loginUser'
};

export const getData = async (url: string, accessToken?: string) => {
    const response = await api.get(url, accessToken);
    return response;
};

export const postData = async (url: string, data?: any, accessToken?: string) => {
    const response = await api.post(url, data, accessToken);
    return response;
};

export const putData = async (url: string, data?: any, accessToken?: string) => {
    const response = await api.put(url, data, accessToken);
    return response;
};

export const deleteData = async (url: string, accessToken?: string) => {
    const response = await api.delete(url, accessToken);
    return response;
};
