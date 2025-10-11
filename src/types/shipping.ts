export interface CreaotrShippingProjectList {
  creatorId: number;
  projectId: number;
  title: string;
  backerCnt: number;

  completedShippingCnt: number;
}

export interface creatorShippingBackerList {
  //유저
  userid: number;
  email: string;
  nickname: string;

  //창작자
  creatorId: number;

  //리워드
  rewardName: string;

  // 배송지
  recipient: string;
  postalCode: string;
  roadAddr: string;
  detailAddr: string;
  recipientPhone: string;

  // 배송
  shippingStatus: string;
  trackingNum: string;
  shippedAt: Date;
  deliveredAt: Date;

  //후원상세
  quantity: number;

  //프로젝트
  projectId: number;
  title: string;
}
