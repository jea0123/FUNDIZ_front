export type CreatorSummary = {
    creator: { creatorId: number; creatorName: string; profileImg?: string | null; bio?: string };
    stats: { projectCount: number; totalBackers: number, totalAmount?: number };
    isFollowed: boolean;
    followerCount: number;
    lastLogin: Date;
};

export type ProjectCard = {
    projectId: number;
    title: string;
    thumbnail: string;
    currAmount: number;
    goalAmount: number;
    backerCnt: number;
    projectStatus: "OPEN" | "SUCCESS" | "FAILED" | "SETTLED" | "CLOSED";
    createdAt: string;
    isSuccess?: boolean;
};

export type ReviewItem = {
    cmId: number;
    user: { nickname: string; profileImg?: string | null };
    project: { projectId: number; title: string; thumbnail?: string | null };
    cmContent: string;
    createdAt: string;
    images?: string[];
};

export type FollowerItem = {
    userId: number;
    nickname: string;
    profileImg?: string | null;
    isFollowed: boolean;
};

export async function fetchCreatorProjectOptions(
    creatorId: number
): Promise<Array<{ projectId: number; title: string }>> {
    await delay(120);
    return MOCK_PROJECTS.map(p => ({ projectId: p.projectId, title: p.title }));
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const img = (w: number, h: number, text?: string) =>
    `https://placehold.co/${w}x${h}?text=${encodeURIComponent(text ?? "")}`;

const MOCK_PROJECTS: ProjectCard[] = Array.from({ length: 18 }).map((_, i) => ({
    projectId: i + 1,
    title: ["사진인화 플러스 집에서 뚝딱", "옥지 에어돔 3in1 무선충전기", "휴대용 아로마 디퓨저"][i % 3] + ` ${i + 1}`,
    thumbnail: img(800, 600, `project ${i + 1}`),
    currAmount: Math.floor(Math.random() * 8_000_000) + 2_000_000,
    goalAmount: 5_000_000,
    backerCnt: Math.floor(Math.random() * 500) + 50,
    projectStatus: ["OPEN", "SUCCESS", "FAILED"][i % 3] as ProjectCard["projectStatus"],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const MOCK_REVIEWS: ReviewItem[] = Array.from({ length: 60 }).map((_, i) => ({
    cmId: 1000 + i,
    user: { nickname: `후원자${i + 1}` },
    project: { projectId: (i % 6) + 1, title: `관련 프로젝트 ${(i % 6) + 1}`, thumbnail: img(320, 240) },
    cmContent: "제품 잘 도착했고 만족합니다.\n후속 프로젝트도 기대할게요 :)",
    createdAt: new Date(Date.now() - i * 3600_000 * 10).toISOString(),
    images: i % 3 === 0 ? [img(400, 300, `후기${i}`), img(400, 300, `추가${i}`)] : [], // 랜덤 첨부
}));

const MOCK_FOLLOWERS: FollowerItem[] = Array.from({ length: 135 }).map((_, i) => ({
    userId: i + 1,
    nickname: ["JH", "김지원", "ralka", "영롱", "아카이브", "스북루"][i % 6] + ` ${i + 1}`,
    isFollowed: Math.random() > 0.7,
}));

export async function fetchCreatorReviews(
    creatorId: number,
    page = 1,
    size = 10,
    projectId?: number
): Promise<{ items: ReviewItem[]; total: number }> {
    await delay(400);
    let list = [...MOCK_REVIEWS];
    if (projectId) list = list.filter(r => r.project.projectId === projectId); // ← 필터링
    const start = (page - 1) * size;
    return { items: list.slice(start, start + size), total: list.length };
}

export async function fetchFollowers(
    creatorId: number,
    page = 1,
    size = 20,
): Promise<{ items: FollowerItem[]; total: number }> {
    await delay(300);
    const start = (page - 1) * size;
    return { items: MOCK_FOLLOWERS.slice(start, start + size), total: MOCK_FOLLOWERS.length };
}
