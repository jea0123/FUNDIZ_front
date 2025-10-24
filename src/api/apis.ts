import type { SearchAdminProjectDto } from '@/types/admin';
import type { SearchCreatorProjectDto } from '@/types/creator';
import type { SearchProjectParams } from '@/types/projects';
import type { SearchNoticeParams } from '@/types/notice';
import type { SearchIqrParams } from '@/types/inquiry';
import type { SearchQnaParams } from '@/types/qna';
import ky from 'ky';
import type { SearchSettlementParams } from '@/types/settlement';
import type { SearchUserParams } from '@/types/users';
import type { SearchReviewsParams } from '@/types/community';

export const kyInstance = ky.create({
  prefixUrl: 'http://localhost:9099/api/v1',
  throwHttpErrors: false,
  hooks: {
    afterResponse: [
      async (_req, _opts, res) => {
        if (res.status >= 400) {
          const body = await res
            .clone()
            .json()
            .catch(() => null);
          const msg = body?.message ?? res.statusText;
          const reqURI = _req.url.replace(String(_opts.prefixUrl ?? ''), '');
          console.error(`${res.status} ${msg}`, reqURI);
          // appNavigate('/error', { state: { message: msg, status: res.status } });
        }
        return res;
      },
    ],
  },
});

type ApiResult<T = any> = { status: number; data: T | null; message?: string | null };

/**
 * @description
 * Fetch Response 객체를 표준 ApiResult 형태로 변환.
 *
 * - JSON 파싱을 우선 시도하고, 실패 시 본문 텍스트를 data로 설정.
 * - 응답 객체가 없거나 falsy하면 status 0과 data null을 반환.
 * - JSON 본문에 message가 있으면 반환 객체의 message로 전달.
 *
 * @template T 응답 데이터의 제네릭 타입(기본값: any).
 * @param res 처리할 Fetch API의 Response 객체.
 * @returns Promise<ApiResult<T>> 변환된 결과. status는 HTTP 상태 코드, data는 body.data(또는 텍스트/없으면 null), message는 body.message(없으면 null).
 *
 * @remarks
 * - JSON이 아닌 응답의 경우, 본문 텍스트가 data에 문자열로 설정.
 * - JSON 응답은 { data, message } 구조를 기대하며, 각 필드가 없으면 null로 대체.
 * - 이 함수는 예외를 던지지 않고, 파싱 실패/비정상 응답은 반환값으로 표현.
 */
const responseHandler = async <T = any>(res: Response): Promise<ApiResult<T>> => {
  if (!res) return { status: 0, data: null };
  let body: any = null;
  try {
    body = res.status !== 204 ? await res.json() : null;
  } catch {
    const txt = await res.text();
    body = { data: txt };
  }
  return { status: res.status, data: body?.data ?? null, message: body.message ?? null } as ApiResult<T>;
};

const authorization = (accessToken?: string) => {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
};

const withBody = (data: any) => (typeof FormData !== 'undefined' && data instanceof FormData ? { body: data } : { json: data ?? {} });

export const api = {
  get: <T = any>(url: string, accessToken?: string) => kyInstance.get(url, { ...authorization(accessToken) }).then((res) => responseHandler<T>(res)),
  post: <T = any>(url: string, data: any, accessToken?: string) => kyInstance.post(url, { ...withBody(data), ...authorization(accessToken) }).then((res) => responseHandler<T>(res)),
  put: <T = any>(url: string, data: any, accessToken?: string) => kyInstance.put(url, { ...withBody(data), ...authorization(accessToken) }).then((res) => responseHandler<T>(res)),
  delete: <T = any>(url: string, accessToken?: string) => kyInstance.delete(url, { ...authorization(accessToken) }).then((res) => responseHandler<T>(res)),
};

const toQueryString = (params: Record<string, unknown>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || v === 'undefined' || v === 'null') return;

    if (Array.isArray(v)) {
      v.forEach((item) => {
        if (item !== undefined && item !== null && item !== '' && item !== 'undefined' && item !== 'null') query.append(k, String(item));
      });
    } else {
      query.append(k, String(v));
    }
  });
  return query.toString();
};

export const endpoints = {
  // ==================== Auth API ====================
  checkEmail: 'auth/checkEmail',
  checkNickname: 'auth/checkNickname',
  signUp: 'auth/signUp',
  signIn: 'auth/signIn',
  withdraw: 'auth/withdraw',
  registerAdmin: 'auth/registerAdmin',
  loginAdmin: 'auth/loginAdmin',

  // ==================== User API ====================
  getLoginUser: 'user/loginUser',
  getLikedList: 'user/likedList',
  getQnAListOfUser: (p: SearchQnaParams) => `user/qna?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup })}`,
  addRecentView: (projectId: number) => `user/recentView/${projectId}`,
  getRecentView: (limit?: number) => `user/recentViewProjects?${toQueryString({ limit })}`,
  updateNickname: 'user/nickname',
  updateProfileImg: 'user/profileImg',
  changePassword: 'user/password',
  likeProject: (projectId: number) => `user/like/${projectId}`,
  dislikeProject: (projectId: number) => `user/dislike/${projectId}`,
  checkLiked: (projectId: number) => `user/checkLike/${projectId}`,
  followCreator: (creatorId: number) => `user/follow/${creatorId}`,
  unfollowCreator: (creatorId: number) => `user/unfollow/${creatorId}`,
  checkFollowed: (creatorId: number) => `user/checkFollow/${creatorId}`,
  getUserSummary: 'user/summary',

  // ==================== Creator API ====================
  getCreatorProjectList: (p: SearchCreatorProjectDto) => `creator/projects?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, projectStatus: p.projectStatus && p.projectStatus.length ? p.projectStatus : undefined, rangeType: p.rangeType || undefined })}`,
  registerCreator: 'creator/register',
  getCreatorInfo: 'creator/info',
  updateCreatorInfo: 'creator/update',
  getCreatorProjectDetail: (projectId: number) => `creator/projects/${projectId}`,
  getCreatorProjectSummary: (projectId: number) => `creator/projects/${projectId}/summary`,
  createProject: 'creator/project/new',
  updateProject: (projectId: number) => `creator/project/${projectId}`,
  submitProject: (projectId: number) => `creator/project/${projectId}/submit`,
  deleteProject: (projectId: number) => `creator/project/${projectId}`,
  getCreatorRewardList: (projectId: number) => `creator/projects/${projectId}/reward`,
  addReward: (projectId: number) => `creator/projects/${projectId}/reward`,
  getCreatorProfileSummary: 'creator/summary',
  uploadThumbnail: 'creator/project/thumbnail',
  getQnAListOfCreator: (p: SearchQnaParams) => `creator/qna?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup })}`,
  creatorDashboard: 'creator/dashBoard',
  creatorBackingList: 'creator/backingList',
  creatorShippingList: 'creator/shippingList',
  creatorShippingBackerList: (projectId: number) => `creator/shippingBackerList/${projectId}`,
  updateCreatorShippingStatus: (projectId: number) => `creator/shippingBackerList/${projectId}`,
  postCreatorNews: (projectId: number) => `creator/projects/${projectId}/news`,
  getFollowerCnt: (creatorId: number) => `creator/followerCnt/${creatorId}`,
  getTotalCounts: (creatorId: number) => `creator/totalCounts/${creatorId}`,
  getCreatorSummary: (creatorId: number) => `creator/summary/${creatorId}`,
  getCreatorProjects: (creatorId: number, sort: string, page: number, size: number) => `creator/projectsList/${creatorId}?${toQueryString({ sort, page, size })}`,
  getCreatorReviews: (creatorId: number, p: SearchReviewsParams) => `creator/reviews/${creatorId}?${toQueryString({ lastId: p.lastId, lastCreatedAt: p.lastCreatedAt ? p.lastCreatedAt.toISOString() : undefined, projectId: p.projectId, photoOnly: p.photoOnly, size: p.size })}`,
  getCreatorFollowers: (creatorId: number, page: number, size: number) => `creator/followers/${creatorId}?${toQueryString({ page, size })}`,
  getCreatorBio: (creatorId: number) => `creator/bio/${creatorId}`,

  // ==================== Project API ====================
  getFeatured: 'project/featured',
  getRecentTop10: 'project/recent-top10',
  searchProject: (p: SearchProjectParams) => `project/search?${toQueryString({ page: p.page, size: p.size, keyword: p.keyword, ctgrId: p.ctgrId, subctgrId: p.subctgrId, sort: p.sort })}`,
  getProjectDetail: (projectId: number) => `project/${projectId}`,
  getCommunityList: (projectId: number) => `project/${projectId}/community`,
  postCommunity: (projectId: number) => `project/${projectId}/community/new`,
  getReviewList: (projectId: number) => `project/${projectId}/review`,
  getReplyList: (cmId: number) => `project/community/${cmId}/reply`,
  postReply: (cmId: number) => `project/community/${cmId}/reply`,
  getQnaListOfProject: (projectId: number) => `project/${projectId}/qna`,
  addQuestion: (projectId: number) => `project/${projectId}/qna/add`,
  getLikeCnt: (projectId: number) => `project/${projectId}/likeCnt`,
  getCounts: (projectId: number) => `project/${projectId}/counts`,
  searchUpComingProjects: (p: SearchProjectParams) => `project/search/upcoming?${toQueryString({ page: p.page, size: p.size, keyword: p.keyword, ctgrId: p.ctgrId, subctgrId: p.subctgrId, sort: p.sort })}`,

  // ==================== QnaReply API ====================
  addQnaReply: (qnaId: number) => `qna/reply/${qnaId}`,
  getQnaReplyList: (qnaId: number) => `qna/reply/${qnaId}`,

  // ==================== Shipping API ====================
  getAddressList: 'shipping/list',
  updateAddress: (addrId: number) => `shipping/update/${addrId}`,
  createAddress: 'shipping/add',
  deleteAddress: (addrId: number) => `shipping/delete/${addrId}`,
  setAddressDefault: (addrId: number) => `shipping/defaultAddr/${addrId}`,

  // ==================== Backing API ====================
  getBackingList: 'backing/page',
  getMypageBackingList: 'backing/myPageBackingList',
  getMypageBackingDetail: (backingId: number) => `backing/myPageBackingDetail/${backingId}`,
  backingPrepare: (projectId: number) => `backing/prepare/${projectId}`,
  addBacking: 'backing/create',
  cancelBacking: (backingId: number) => `backing/cancel/${backingId}`,

  // ==================== Admin API ====================
  getAdminAnalytics: (period: string, metric: string) => `admin/analytics?period=${period}&metric=${metric}`,
  getCategorySuccess: (ctgrId: number) => `admin/category-success?ctgrId=${ctgrId}`,
  getRewardSalesTop: (period: string, metric: string) => `admin/reward-sales-top?period=${period}&metric=${metric}`,
  getProjectVerifyList: (p: SearchAdminProjectDto) => `admin/verify?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, projectStatus: p.projectStatus && p.projectStatus.length ? p.projectStatus : undefined, rangeType: p.rangeType || undefined })}`,
  getProjectVerifyDetail: (projectId: number) => `admin/verify/${projectId}`,
  approveProject: (projectId: number) => `admin/verify/${projectId}/approve`,
  rejectProject: (projectId: number) => `admin/verify/${projectId}/reject`,
  getAdminProjectList: (p: SearchAdminProjectDto) => `admin/project?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, projectStatus: p.projectStatus && p.projectStatus.length ? p.projectStatus : undefined, rangeType: p.rangeType || undefined })}`,
  adminUpdateProject: (projectId: number) => `admin/project/${projectId}`,
  cancelProject: (projectId: number) => `admin/project/${projectId}/cancel`,
  getUsers: (p: SearchUserParams) => `admin/user/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getSettlements: (p: SearchSettlementParams) => `admin/settlement/list?${toQueryString({ q: p.q, status: p.status, from: p.from, to: p.to, page: p.page, size: p.size, perGroup: p.perGroup })}`,
  getSettlementSummary: 'admin/settlement/summary',
  updateStatus: 'admin/settlement',
  getUserInfo: (userId: number) => `admin/user/info/${userId}`,
  updateUser: (userId: number) => `admin/user/update/${userId}`,
  addNotice: 'admin/notice/add',
  updateNotice: (noticeId: number) => `admin/notice/update/${noticeId}`,
  deleteNotice: (noticeId: number) => `admin/notice/delete/${noticeId}`,
  updateReportStatus: (reportId: number) => `admin/report/update/${reportId}`,
  createCategory: 'admin/categories/create',
  createSubcategory: 'admin/subcategories/create',

  // ==================== Category API ====================
  getCategories: 'categories',
  getSubcategories: 'categories/subcategories',

  // ==================== Customer Service API ====================
  getNotices: (p: SearchNoticeParams) => `cs/notice/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getNoticeDetail: (noticeId: number) => `cs/notice/${noticeId}`,
  getInquiries: (p: SearchIqrParams) => `cs/inquiry/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getMyInquiries: (p: SearchIqrParams) => `cs/inquiry/mylist?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getInqDetail: (inqId: number) => `cs/inquiry/${inqId}`,
  addInquiry: 'cs/inquiry/add',
  getReports: (p: SearchIqrParams) => `cs/report/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getMyReports: (p: SearchIqrParams) => `cs/report/mylist?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getReportDetail: (reportId: number) => `cs/report/${reportId}`,
  addReport: 'cs/report/add',
  getInquiryReplyList: (inqId: number) => `cs/inquiry/reply/${inqId}`,
  addInquiryReply: (inqId: number) => `cs/inquiry/reply/${inqId}`,

  // ==================== Notification API ====================
  getNotificationSSE: (userId: number) => `notifications/stream?userId=${userId}`,
  getNotifications: 'notifications/list',
  markAsRead: (notificationId: number) => `notifications/read/${notificationId}`,
  markAllAsRead: 'notifications/readAll',
  deleteNotification: (notificationId: number) => `notifications/delete/${notificationId}`,
  deleteAllNotifications: 'notifications/deleteAll',

  // ==================== Settlement API ====================
  getCreatorSettlement: 'settlement/creator',

  //==================== Payment API ====================
  getCardList: 'payment/cardList',
  addCard: 'payment/addCardList',
  deleteCard: (paymentId: number) => `payment/deleteCard/${paymentId}`,
};

/**
 * @description API에서 데이터 가져오기
 * @param {string} url - API 엔드포인트 URL
 * @param {string} [accessToken] - 인증을 위한 액세스 토큰 (선택 사항)
 * @returns {Promise<Response>} - API로부터의 응답
 */
export const getData = async <T = any>(url: string, accessToken?: string): Promise<ApiResult<T>> => {
  return api.get<T>(url, accessToken);
};

/**
 * @description API에 데이터 전송
 * @param {string} url - API 엔드포인트 URL
 * @param {*} [data] - API에 전송할 데이터
 * @param {string} [accessToken] - 인증을 위한 액세스 토큰 (선택 사항)
 * @returns {Promise<Response>} - API로부터의 응답
 */
export const postData = async <T = any>(url: string, data?: any, accessToken?: string): Promise<ApiResult<T>> => {
  return api.post<T>(url, data, accessToken);
};

/**
 * @description 데이터 수정
 * @param {string} url - API 엔드포인트 URL
 * @param {*} [data] - API에 전송할 데이터
 * @param {string} [accessToken] - 인증을 위한 액세스 토큰 (선택 사항)
 * @returns {Promise<Response>} - API로부터의 응답
 */
export const putData = async <T = any>(url: string, data?: any, accessToken?: string): Promise<ApiResult<T>> => {
  return api.put<T>(url, data, accessToken);
};

/**
 * @description 데이터 삭제
 * @param {string} url - API 엔드포인트 URL
 * @param {string} [accessToken] - 인증을 위한 액세스 토큰 (선택 사항)
 * @returns {Promise<Response>} - API로부터의 응답
 */
export const deleteData = async <T = any>(url: string, accessToken?: string): Promise<ApiResult<T>> => {
  return api.delete<T>(url, accessToken);
};
