
import type { SearchProjectVerify } from '@/types/admin';
import type { SearchProjectParams } from '@/types/projects';
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

const toQueryString = (params: Record<string, unknown>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
    });
    return query.toString();
};

export const endpoints = {
    // ==================== Auth API ====================
    checkEmail: '/auth/checkEmail',
    checkNickname: '/auth/checkNickname',
    signUp: '/auth/signUp',
    signIn: '/auth/signIn',

    // ==================== User API ====================
    getLoginUser: '/user/loginUser',
    getMypage: (userId: number) => `/user/userPage/${userId}`,
    getCreatorPageList : (creatorId :number)=>`/creator/${creatorId}/list`,
    getLikedList: (userId: number) => `/user/likedList/${userId}`,
    getQnAList: (userId: number) => `/user/QnAList/${userId}`,
    getRecentView: (userId: number) => `/user/recentViewProjects/${userId}`,
    getQnAListDetail: (userId: number, projectId: number) => `/user/QnAListDetail/${userId}/project/${projectId}`,

    // ==================== Project API ====================
    createProject: '/project',
    getFeatured: '/project/featured',
    getRecentTop10: '/project/recent-top10',
    getProjectDetail: (projectId: number) => `/project/${projectId}`,
    getCommunity: (projectId: number) => `/project/${projectId}/community`,
    getReview: (projectId: number) => `/project/${projectId}/review`,
    searchProject: (p: SearchProjectParams) => `/project/search?${toQueryString({ page: p.page, size: p.size, keyword: p.keyword, ctgrId: p.ctgrId, subctgrId: p.subctgrId, sort: p.sort })}`,

    // ==================== Shipping API ====================
    getAddressList: (userId: number) => `/shipping/${userId}/list`,
    updateAddress: (userId: number, addrId: number) => `/shipping/${userId}/update/${addrId}`,
    createAddress: (userId: number) => `/shipping/${userId}/add`,
    deleteAddress: (userId: number, addrId: number) => `/shipping/${userId}/delete/${addrId}`,
    setAddressDefault: (userId: number, addrId: number) => `/shipping/${userId}/defaultAddr/${addrId}`,

    // ==================== Backing API ====================
    getBackingList: (userId: number) => `/Backing/page/${userId}`,
    getBackingDetail: (userId: number, projectId: number, rewardId: number) => `/Backing/page/${userId}/project/${projectId}/reward/${rewardId}`,

    // ==================== Admin API ====================
    getAdminAnalytics: (period: string, metric: string) => `/admin/analytics?period=${period}&metric=${metric}`,
    getCategorySuccess: (ctgrId: number) => `/admin/category-success?ctgrId=${ctgrId}`,
    getRewardSalesTop: (period: string, metric: string) => `/admin/reward-sales-top?period=${period}&metric=${metric}`,
    getProjectVerifyList: (p: SearchProjectVerify) => `/admin/verify?${toQueryString({ page: p.page, size: p.size, projectStatus: p.projectStatus, rangeType: p.rangeType || undefined })}`,
    approveProject: (projectId: number) => `/admin/verify/approve/${projectId}`,
    rejectProject: (projectId: number) => `/admin/verify/reject/${projectId}`,
    getProjectVerifyDetail: (projectId: number) => `/admin/verify/${projectId}`,
    getAdminProjectList: (p: SearchProjectVerify) => `/admin/project?${toQueryString({ page: p.page, size: p.size, projectStatus: p.projectStatus, rangeType: p.rangeType || undefined })}`,
    adminUpdateProject: (projectId: number) => `/admin/project/${projectId}`,

    // ==================== Category API ====================
    getCategories: '/categories',
    getSubcategories: '/categories/subcategories',

    // ==================== Customer Service API ====================
    getNotices: '/cs/notice',
    getNoticeDetail: (noticeId: number) => `/cs/notice/${noticeId}`,
    addNotice: '/cs/notice/add',
    updateNotice: (noticeId: number) => `/cs/notice/update/${noticeId}`,
    deleteNotice: (noticeId: number) => `/cs/notice/delete/${noticeId}`,
    getInquiries: '/cs/inquiry/list',
    getMyInquiries: (userId: number) => `/cs/inquiry/mylist/${userId}`,
    getInqDetail: (inqId: number) => `/cs/inquiry/${inqId}`,
    addInquiry: (userId: number) => `/cs/inquiry/${userId}/add`,
    getReports: '/cs/report/list',
    getMyReports: (userId: number) => `/cs/report/mylist/${userId}`,
    getReportDetail: (reportId: number) => `/cs/report/${reportId}`,
    addReport: (userId: number) => `/cs/report/${userId}/add`,
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
