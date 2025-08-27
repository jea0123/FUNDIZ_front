
import type { AxiosResponse } from 'axios';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:9099/api/v1',
    validateStatus: () => true
});

const responseHandler = (response: AxiosResponse<any, any>) => {
    if (!response) return { status: 0, data: null };
    return { status: response.status, data: response.data ?? null };
};

const api = {
    get: (url: string) => axiosInstance.get(url).then(responseHandler),
    post: (url: string, data: any) => axiosInstance.post(url, data).then(responseHandler),
    put: (url: string, data: any) => axiosInstance.put(url, data).then(responseHandler),
    delete: (url: string) => axiosInstance.delete(url).then(responseHandler),
};

export const endpoints = {
    checkEmail: '/auth/checkEmail',
    checkNickname: '/auth/checkNickname',
    signUp: '/auth/signUp'
};

export const getData = async (url: string) => {
    const response = await api.get(url);
    return response;
};

export const postData = async (url: string, data?: any) => {
    const response = await api.post(url, data);
    return response;
};

export const putData = async (url: string, data?: any) => {
    const response = await api.put(url, data);
    return response;
};

export const deleteData = async (url: string) => {
    const response = await api.delete(url);
    return response;
};
