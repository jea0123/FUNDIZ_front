import type { SearchProjectDto } from '@/types/admin';
import type { SearchCreatorProjectDto } from '@/types/creator';
import type { SearchProjectParams } from '@/types/projects';
import type { SearchNoticeParams } from '@/types/notice';
import type { SearchIqrParams } from '@/types/inquiry';
import type { SearchUserParams } from '@/types/admin';
import type { SearchQnaParams } from '@/types/qna';
import ky from 'ky';

export const kyInstance = ky.create({
  prefixUrl: 'http://localhost:9099/api/v1',
  throwHttpErrors: false,
  hooks: {
    afterResponse: [
      async (_req, _opts, res) => {
        if (res.status >= 400) {
          const body = await res.clone().json().catch(() => null);
          const msg = body?.message ?? res.statusText;
          console.error(`${res.status} ${msg}`);
          // appNavigate('/error', { state: { message: msg, status: res.status } });
        }
        return res;
      },
    ],
  },
});

type ApiResult<T = any> = { status: number; data: T | null };

const responseHandler = async <T = any>(res: Response): Promise<ApiResult<T>> => {
  if (!res) return { status: 0, data: null };
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    const txt = await res.text();
    body = { data: txt };
  }
  return { status: res.status, data: body?.data ?? null };
};

const authorization = (accessToken: string | undefined) => {
  return { headers: { Authorization: `Bearer ${accessToken}` } };
};

export const api = {
  get: <T = any>(url: string, accessToken?: string) => kyInstance.get(url, { ...authorization(accessToken) }).then(res => responseHandler<T>(res)),
  post: <T = any>(url: string, data: any, accessToken?: string) => kyInstance.post(url, { json: data, ...authorization(accessToken) }).then(res => responseHandler<T>(res)),
  put: <T = any>(url: string, data: any, accessToken?: string) => kyInstance.put(url, { json: data, ...authorization(accessToken) }).then(res => responseHandler<T>(res)),
  delete: <T = any>(url: string, accessToken?: string) => kyInstance.delete(url, { ...authorization(accessToken) }).then(res => responseHandler<T>(res)),
};

const toQueryString = (params: Record<string, unknown>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
  });
  return query.toString();
};

export const endpoints = {

  // ==================== Auth API ====================
  checkEmail: 'auth/checkEmail',
  checkNickname: 'auth/checkNickname',
  signUp: 'auth/signUp',
  signIn: 'auth/signIn',

  // ==================== User API ====================
  getLoginUser: 'user/loginUser',
  getMypage: (userId: number) => `user/userPage/${userId}`,
  getLikedList: (userId: number) => `user/likedList/${userId}`,
  getQnAList: (userId: number) => `user/QnAList/${userId}`,
  getRecentView: (userId: number) => `user/recentViewProjects/${userId}`,
  getQnAListDetail: (userId: number, projectId: number) => `user/QnAListDetail/${userId}/project/${projectId}`,

  // ==================== Creator API ====================
  getCreatorProjectList: (p: SearchCreatorProjectDto) => `creator/projects?${toQueryString({ page: p.page, size: p.size, projectStatus: p.projectStatus, rangeType: p.rangeType || undefined, })}`,
  getCreatorProjectDetail: (projectId: number) => `creator/projects/${projectId}`,
  createProject: 'creator/project/new',
  updateProject: (projectId: number) => `creator/project/${projectId}`,
  submitProject: (projectId: number) => `creator/project/${projectId}/submit`,
  deleteProject: (projectId: number) => `creator/project/${projectId}`,
  getCreatorProjectSummary: (projectId: number) => `creator/projects/${projectId}/summary`,
  getCreatorRewardList: (projectId: number) => `creator/projects/${projectId}/reward`,
  addReward: (projectId: number) => `creator/projects/${projectId}/reward`,
  getQnAListOfCreator: (p: SearchQnaParams) => `creator/qna?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup })}`,

  // ==================== Project API ====================
  getFeatured: 'project/featured',
  getRecentTop10: 'project/recent-top10',
  getProjectDetail: (projectId: number) => `project/${projectId}`,
  getCommunityList: (projectId: number) => `project/${projectId}/community`,
  getReviewList: (projectId: number) => `project/${projectId}/review`,
  getQnaListOfPJ: (projectId: number, p: SearchQnaParams) => `project/${projectId}/qna?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup })}`,
  searchProject: (p: SearchProjectParams) => `project/search?${toQueryString({ page: p.page, size: p.size, keyword: p.keyword, ctgrId: p.ctgrId, subctgrId: p.subctgrId, sort: p.sort, })}`,

  // ==================== Shipping API ====================
  getAddressList: (userId: number) => `shipping/${userId}/list`,
  updateAddress: (userId: number, addrId: number) => `shipping/${userId}/update/${addrId}`,
  createAddress: (userId: number) => `shipping/${userId}/add`,
  deleteAddress: (userId: number, addrId: number) => `shipping/${userId}/delete/${addrId}`,
  setAddressDefault: (userId: number, addrId: number) => `shipping/${userId}/defaultAddr/${addrId}`,

  // ==================== Backing API ====================
  getBackingList: (userId: number) => `backing/page/${userId}`,
  getBackingDetail: (userId: number, projectId: number, rewardId: number) => `backing/page/${userId}/project/${projectId}/reward/${rewardId}`,

  // ==================== Admin API ====================
  getAdminAnalytics: (period: string, metric: string) => `admin/analytics?period=${period}&metric=${metric}`,
  getCategorySuccess: (ctgrId: number) => `admin/category-success?ctgrId=${ctgrId}`,
  getRewardSalesTop: (period: string, metric: string) => `admin/reward-sales-top?period=${period}&metric=${metric}`,
  getProjectVerifyList: (p: SearchProjectDto) => `admin/verify?${toQueryString({ page: p.page, size: p.size, projectStatus: p.projectStatus, rangeType: p.rangeType || undefined, })}`,
  getProjectVerifyDetail: (projectId: number) => `admin/verify/${projectId}`,
  approveProject: (projectId: number) => `admin/verify/${projectId}/approve`,
  rejectProject: (projectId: number) => `admin/verify/${projectId}/reject`,
  getAdminProjectList: (p: SearchProjectDto) => `admin/project?${toQueryString({ page: p.page, size: p.size, projectStatus: p.projectStatus, rangeType: p.rangeType || undefined, })}`,
  adminUpdateProject: (projectId: number) => `admin/project/${projectId}`,
  cancelProject: (projectId: number) => `admin/project/${projectId}/cancel`,
  getUsers: (p: SearchUserParams) => `admin/user/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword, })}`,

  // ==================== Category API ====================
  getCategories: 'categories',
  getSubcategories: 'categories/subcategories',

  // ==================== Customer Service API ====================
  getNotices: (p: SearchNoticeParams) => `cs/notice/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword, })}`,
  getNoticeDetail: (noticeId: number) => `cs/notice/${noticeId}`,
  addNotice: 'cs/notice/add',
  updateNotice: (noticeId: number) => `cs/notice/update/${noticeId}`,
  deleteNotice: (noticeId: number) => `cs/notice/delete/${noticeId}`,
  getInquiries: (p: SearchIqrParams) => `cs/inquiry/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword, })}`,
  getMyInquiries: (userId: number, p: SearchIqrParams) => `cs/inquiry/mylist/${userId}?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword, })}`,
  getInqDetail: (inqId: number) => `cs/inquiry/${inqId}`,
  addInquiry: (userId: number) => `cs/inquiry/${userId}/add`,
  getReports: (p: SearchIqrParams) => `cs/report/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword, })}`,
  getMyReports: (userId: number, p: SearchIqrParams) => `cs/report/mylist/${userId}?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword, })}`,
  getReportDetail: (reportId: number) => `cs/report/${reportId}`,
  addReport: (userId: number) => `cs/report/${userId}/add`,

  // ==================== Notification API ====================
  getNotificationSSE: (userId: number) => `notifications/stream?userId=${userId}`,
  getNotifications: 'notifications/list',
  markAsRead: (notificationId: number) => `notifications/read/${notificationId}`,
  markAllAsRead: 'notifications/readAll',
  deleteNotification: (notificationId: number) => `notifications/delete/${notificationId}`,
  deleteAllNotifications: 'notifications/deleteAll',
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
