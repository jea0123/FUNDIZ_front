import type { SearchProjectDto } from '@/types/admin';
import type { SearchCreatorProjectDto } from '@/types/creator';
import type { SearchProjectParams } from '@/types/projects';
import type { SearchNoticeParams } from '@/types/notice';
import type { SearchIqrParams } from '@/types/inquiry';
import type { SearchQnaParams } from '@/types/qna';
import ky from 'ky';
import type { SearchSettlementParams } from '@/types/settlement';
import type { SearchUserParams } from '@/types/users';

//TODO: 모듈 전역 오버라이드 값 (훅에서 주입)
let _devCreatorIdOverride: string | null = null;

//TODO: 컴포넌트/훅에서 호출해서 오버라이드 설정
export const setDevCreatorIdHeader = (id: number | null | undefined) => {
  _devCreatorIdOverride = id != null ? String(id) : null;
};

export const kyInstance = ky.create({
  prefixUrl: 'http://localhost:9099/api/v1',
  throwHttpErrors: false,
  hooks: {
    //TODO: beforeRequest 추가 (X-Dev-Creator-Id)
    beforeRequest: [
      (req) => {
        const isDev = import.meta.env?.DEV === true || import.meta.env?.MODE === 'development';
        if (!isDev) return;

        let url: URL | null = null;
        try {
          url = new URL(req.url);
        } catch {
          try {
            url = new URL(String(req.url), 'http://dummy');
          } catch {
            url = null;
          }
        }
        const pathname = url?.pathname ?? String(req.url);

        if (pathname.includes('/api/v1/creator/')) {
          // 우선순위: 훅 주입값 > URL 쿼리 > localStorage > (없으면 미부착)
          const fromOverride = _devCreatorIdOverride;
          const fromQuery = url?.searchParams.get('creatorId') || null;
          const fromLocal = localStorage.getItem('DEV_CREATOR_ID');

          const devId = fromOverride ?? fromQuery ?? fromLocal ?? null;

          if (devId) {
            req.headers.set('X-Dev-Creator-Id', devId);
          } else {
            req.headers.delete?.('X-Dev-Creator-Id');
          }
        }
      },
    ],
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
  withdraw: 'auth/withdraw',
  registerAdmin: 'auth/registerAdmin',
  loginAdmin: 'auth/loginAdmin',

  // ==================== User API ====================
  getLoginUser: 'user/loginUser',
  getMypage: (userId: number) => `user/userPage/${userId}`,
  getLikedList: (userId: number) => `user/likedList/${userId}`,
  getQnAListOfUser: (userId: number, p: SearchQnaParams) => `user/qna/${userId}?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup })}`,
  addRecentView: (projectId: number) => `user/recentView/${projectId}`,
  getRecentView: `user/recentViewProjects`,
  getQnAListDetail: (userId: number, projectId: number) => `user/QnAListDetail/${userId}/project/${projectId}`,
  updateNickname: 'user/nickname',
  updateProfileImg: 'user/profileImg',
  changePassword: 'user/password',
  likeProject: (projectId: number) => `user/like/${projectId}`,
  dislikeProject: (projectId: number) => `user/dislike/${projectId}`,
  checkLiked: (projectId: number) => `user/checkLike/${projectId}`,
  followCreator: (creatorId: number) => `user/follow/${creatorId}`,
  unfollowCreator: (creatorId: number) => `user/unfollow/${creatorId}`,
  checkFollowed: (creatorId: number) => `user/checkFollow/${creatorId}`,

  // ==================== Creator API ====================
  getCreatorProjectList: (p: SearchCreatorProjectDto) => `creator/projects?${toQueryString({ page: p.page, size: p.size, projectStatus: p.projectStatus, rangeType: p.rangeType || undefined })}`,
  registerCreator: 'creator/register',
  getCreatorInfo:  'creator/info',
  updateCreatorInfo: (creatorId: number) => `creator/update/${creatorId}`,
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
  postCreatorNews: (projectId: number) => `creator/projects/${projectId}/news`,
  getFollowerCnt: (creatorId: number) => `creator/followerCnt/${creatorId}`,

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
  addQuestion: (projectId: number, userId: number) => `project/${projectId}/qna/${userId}/add`,
  getLikeCnt: (projectId: number) => `project/${projectId}/likeCnt`,

  // ==================== QnaReply API ====================
  getQnaReplyList: (qnaId: number) => `qna/reply/${qnaId}`,
  addQnaReply: (qnaId: number) => `qna/reply/${qnaId}`,

  // ==================== Shipping API ====================
  getAddressList: (userId: number) => `shipping/${userId}/list`,
  updateAddress: (userId: number, addrId: number) => `shipping/${userId}/update/${addrId}`,
  createAddress: (userId: number) => `shipping/${userId}/add`,
  deleteAddress: (userId: number, addrId: number) => `shipping/${userId}/delete/${addrId}`,
  setAddressDefault: (userId: number, addrId: number) => `shipping/${userId}/defaultAddr/${addrId}`,

  // ==================== Backing API ====================
  getBackingList: (userId: number) => `backing/page/${userId}`,
  getBackingDetail: (userId: number, projectId: number, rewardId: number, backingId: number) => `backing/page/${userId}/project/${projectId}/reward/${rewardId}/backing/${backingId}`,
  //교체후보
  getMypageBackingList: (userId: number) => `backing/myPageBackingList/${userId}`,
  getMypageBackingDetail: (userId: number) => `backing/myPageBackingDetail/${userId}`,
  //여기까지
  backingPrepare: (userId: number, projectId: number) => `backing/${userId}/create/${projectId}`,
  addBacking: (userId: number) => `backing/create/${userId}`,

  // ==================== Admin API ====================
  getAdminAnalytics: (period: string, metric: string) => `admin/analytics?period=${period}&metric=${metric}`,
  getCategorySuccess: (ctgrId: number) => `admin/category-success?ctgrId=${ctgrId}`,
  getRewardSalesTop: (period: string, metric: string) => `admin/reward-sales-top?period=${period}&metric=${metric}`,
  getProjectVerifyList: (p: SearchProjectDto) => `admin/verify?${toQueryString({ page: p.page, size: p.size, projectStatus: p.projectStatus, rangeType: p.rangeType || undefined })}`,
  getProjectVerifyDetail: (projectId: number) => `admin/verify/${projectId}`,
  approveProject: (projectId: number) => `admin/verify/${projectId}/approve`,
  rejectProject: (projectId: number) => `admin/verify/${projectId}/reject`,
  getAdminProjectList: (p: SearchProjectDto) => `admin/project?${toQueryString({ page: p.page, size: p.size, projectStatus: p.projectStatus, rangeType: p.rangeType || undefined })}`,
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

  // ==================== Category API ====================
  getCategories: 'categories',
  getSubcategories: 'categories/subcategories',

  // ==================== Customer Service API ====================
  getNotices: (p: SearchNoticeParams) => `cs/notice/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getNoticeDetail: (noticeId: number) => `cs/notice/${noticeId}`,
  getInquiries: (p: SearchIqrParams) => `cs/inquiry/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getMyInquiries: (userId: number, p: SearchIqrParams) => `cs/inquiry/mylist/${userId}?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getInqDetail: (inqId: number) => `cs/inquiry/${inqId}`,
  addInquiry: (userId: number) => `cs/inquiry/${userId}/add`,
  getReports: (p: SearchIqrParams) => `cs/report/list?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getMyReports: (userId: number, p: SearchIqrParams) => `cs/report/mylist/${userId}?${toQueryString({ page: p.page, size: p.size, perGroup: p.perGroup, keyword: p.keyword })}`,
  getReportDetail: (reportId: number) => `cs/report/${reportId}`,
  addReport: (userId: number) => `cs/report/${userId}/add`,
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
