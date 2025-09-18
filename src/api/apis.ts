
import { appNavigate } from '@/utils/navigator';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import { use } from 'react';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:9099/api/v1',
    validateStatus: () => true
});

const responseHandler = (response: AxiosResponse<any, any>) => {
    if (!response) return { status: 0, data: null };
    // if (response.status >= 400) {
    //     appNavigate("/error", { state: { message: response.data, status: response.status } });
    //     return { status: response.status, data: null };
    // }
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
    checkEmail: '/auth/checkEmail',    checkNickname: '/auth/checkNickname',
    signUp: '/auth/signUp',
    signIn: '/auth/signIn',
    getLoginUser: '/user/loginUser',
    getRecentTop10: '/project/recent-top10',
    getMypage: (userId : number) => `/user/me/userPage/${userId}`,
    getAddressList: (userId: number) =>  `/shipping/${userId}/list`,
    createAddress: (userId: number) => `/shipping/${userId}/add`,
    getBackingList: (userId: number)=>`/Backing/me/backingPage/${userId}`,
    getBackingDetail: (userId: number, projectId: number, rewardId: number) => `/Backing/me/backingPage/${userId}/project/${projectId}/reward/${rewardId}`,
    getLikedList: (userId: number) => `/user/me/likedList/${userId}`,
    getProjectDetail: (projectId: number) => `/project/${projectId}`,
    getQnAList: (userId: number) => `/user/me/QnAList/${userId}`,
    getQnAListDetail: (userId: number, projectId: number)=> `/user/me/QnAListDetail/${userId}/project/${projectId}`,
    getCommunity: (projectId: number) => `/project/${projectId}/community`,
    getReview: (projectId: number) => `/project/${projectId}/review`,
    getFeatured: '/project/featured',
    getRecentView: (userId: number) => `/user/recentViewProjects/${userId}`,
    getCategories: '/categories',
    getAdminAnalytics: (period: string, metric: string) => `/admin/analytics?period=${period}&metric=${metric}`,
    getCategorySuccess: (ctgrId: number) => `/admin/category-success?ctgrId=${ctgrId}`,
    createProject: '/project',
    getSubcategories: '/categories/subcategories',
    getRewardSalesTop: (period: string, metric: string) => `/admin/reward-sales-top?period=${period}&metric=${metric}`,
    getProjectPage: '/project/search',
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
