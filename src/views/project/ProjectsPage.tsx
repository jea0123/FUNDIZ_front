import { useState, useEffect } from "react";
import { Link, NavLink, useParams, useSearchParams } from "react-router-dom";
import { Heart, Calendar, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import axios from "axios";

/**
 * ProjectsPage.tsx — All / Category / Subcategory
 *
 * 기존 ProjectsPage의 UI/패턴을 그대로 유지하면서 라우트 3종으로 분리했습니다.
 * (카테고리 칩, 정렬 버튼, 카드 UI, 좋아요 토글 등)
 *
 * - 전체:        /projects
 * - 카테고리별:  /projects/c/:categoryId
 * - 서브카테고리:/projects/c/:categoryId/s/:subcategoryId
 *
 * 백엔드 페이지네이션 + 검색 + 서버 정렬 파라미터를 지원합니다.
 *  GET /api/v1/projects?keyword=...&ctgrId=...&subctgrId=...&sort=liked|recent|amount|deadline|percent&size=20&page=1
 */

/* ----------------------------- Catalog Types ----------------------------- */

export type CategoryKey = "tech" | "fashion" | "character";
export type SubcategoryKey =
  | "iot"
  | "wireless"
  | "eco"
  | "accessory"
  | "kawaii"
  | "stationery";

export const CATEGORIES: { id: CategoryKey; name: string }[] = [
  { id: "tech", name: "테크/가전/리빙" },
  { id: "fashion", name: "패션/뷰티" },
  { id: "character", name: "캐릭터/굿즈/디자인" },
];

export const SUBCATEGORIES: Record<
  CategoryKey,
  { id: SubcategoryKey; name: string }[]
> = {
  tech: [
    { id: "iot", name: "IoT" },
    { id: "wireless", name: "무선/충전" },
  ],
  fashion: [
    { id: "eco", name: "에코/지속가능" },
    { id: "accessory", name: "액세서리" },
  ],
  character: [
    { id: "kawaii", name: "동물/카와이" },
    { id: "stationery", name: "문구/굿즈" },
  ],
};

export type ProjectCard = {
  id: string;
  title: string;
  description: string;
  category?: CategoryKey;
  subcategory?: SubcategoryKey;
  image: string;
  creator: string;
  targetAmount: number;
  currentAmount: number;
  backers: number;
  daysLeft: number;
  likes: number;
  tags: string[];
  createdAt: string;
};

/* ------------------------------ Shared Logic ------------------------------ */

type SortKey = "likes" | "latest" | "amount" | "deadline" | "achievement" | "view";

const SORT_OPTIONS: { id: SortKey; name: string }[] = [
  { id: "likes", name: "좋아요순" },
  { id: "latest", name: "최신순" },
  { id: "amount", name: "모집금액순" },
  { id: "deadline", name: "마감임박순" },
  { id: "achievement", name: "달성률순" },
  { id: "view", name: "조회순" },
];

// 프런트 정렬키 → 백엔드 dto.sort 매핑
const SORT_MAP: Record<SortKey, "liked" | "recent" | "amount" | "deadline" | "percent" | "view"> = {
  likes: "liked",
  latest: "recent",
  amount: "amount",
  deadline: "deadline",
  achievement: "percent",
  view: "view",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

function achievementRate(current: number, target: number) {
  if (!target) return 0;
  return Math.round((current / target) * 100);
}

/* --------------------------------- Layout -------------------------------- */

function CategoryChips({ activeCategory }: { activeCategory?: CategoryKey | "all" }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button asChild variant={!activeCategory || activeCategory === "all" ? "default" : "outline"}>
        <Link to="/projects">전체</Link>
      </Button>
      {CATEGORIES.map((c) => (
        <Button key={c.id} asChild variant={activeCategory === c.id ? "default" : "outline"}>
          <Link to={`/projects/c/${c.id}`}>{c.name}</Link>
        </Button>
      ))}
    </div>
  );
}

function SubcategoryTabs({ categoryId, activeSub }: { categoryId: CategoryKey; activeSub?: SubcategoryKey }) {
  const subs = SUBCATEGORIES[categoryId] ?? [];
  if (!subs.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {subs.map((s) => (
        <Button key={s.id} asChild size="sm" variant={activeSub === s.id ? "default" : "ghost"} className="rounded-full">
          <Link to={`/projects/c/${categoryId}/s/${s.id}`}>{s.name}</Link>
        </Button>
      ))}
    </div>
  );
}

function SortBar({ value, onChange, total }: { value: SortKey; onChange: (s: SortKey) => void; total: number }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <p className="text-gray-600">총 {total}개의 프로젝트</p>
      <div className="flex gap-2">
        {SORT_OPTIONS.map((opt) => (
          <Button key={opt.id} variant={value === opt.id ? "default" : "ghost"} size="sm" onClick={() => onChange(opt.id)}>
            {opt.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ProjectGrid({ items }: { items: ProjectCard[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((p) => (
        <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <ImageWithFallback src={p.image} alt={p.title} className="w-full h-48 object-cover cursor-pointer" />
          </div>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-1 mb-2">
              {p.tags.slice(0, 2).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
            <h3 className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-blue-600">
              <Link to={`/project/${p.id}`}>{p.title}</Link>
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">달성률</span>
                <span className="font-semibold text-blue-600">{achievementRate(p.currentAmount, p.targetAmount)}%</span>
              </div>
              <Progress value={achievementRate(p.currentAmount, p.targetAmount)} className="h-2" />
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">{formatCurrency(p.currentAmount)}원</span>
                <span className="text-gray-500">목표 {formatCurrency(p.targetAmount)}원</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="w-full flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{p.backers}명</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{p.daysLeft}일 남음</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{p.likes}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function Crumbs({ categoryId, subcategoryId }: { categoryId?: CategoryKey; subcategoryId?: SubcategoryKey }) {
  const cat = categoryId ? CATEGORIES.find((c) => c.id === categoryId)?.name : undefined;
  const sub = categoryId && subcategoryId ? SUBCATEGORIES[categoryId]?.find((s) => s.id === subcategoryId)?.name : undefined;
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <NavLink to="/projects" className={({ isActive }) => (isActive ? "text-black" : "hover:text-black")}>프로젝트</NavLink>
      {categoryId && (
        <>
          <ChevronRight className="h-4 w-4" />
          <NavLink to={`/projects/c/${categoryId}`} className="hover:text-black">{cat}</NavLink>
        </>
      )}
      {subcategoryId && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="text-black">{sub}</span>
        </>
      )}
    </div>
  );
}

/* --------------------------------- Data Hook ------------------------------ */

type PageResult<T> = { items: T[]; total: number; page: number; size: number };

type FetchParams = {
  categoryId?: CategoryKey;
  subcategoryId?: SubcategoryKey;
  sort?: SortKey;
  page?: number;
  size?: number;
  keyword?: string;
};

type ApiProjectRow = {
  projectId: number;
  title: string;
  content?: string;
  thumbnail?: string;
  goalAmount?: number;
  currAmount?: number;
  endDate?: string;
  creatorName?: string;
  backerCnt?: number;
  likeCnt?: number;
  createdAt?: string;
  viewCnt?: number;
  category?: CategoryKey;
  subcategory?: SubcategoryKey;
  tags?: string[];
};

function daysLeftFrom(endDateISO?: string) {
  if (!endDateISO) return 0;
  const end = new Date(endDateISO);
  const today = new Date();
  const ms = end.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function mapRow(r: ApiProjectRow, injected?: { category?: CategoryKey; subcategory?: SubcategoryKey }): ProjectCard {
  return {
    id: String(r.projectId),
    title: r.title,
    description: r.content ?? "",
    image: r.thumbnail ?? "",
    creator: r.creatorName ?? "",
    targetAmount: r.goalAmount ?? 0,
    currentAmount: r.currAmount ?? 0,
    backers: r.backerCnt ?? 0,
    daysLeft: daysLeftFrom(r.endDate),
    likes: r.likeCnt ?? 0,
    tags: r.tags ?? [],
    createdAt: r.createdAt ?? r.endDate ?? new Date().toISOString(),
    category: r.category ?? injected?.category,
    subcategory: r.subcategory ?? injected?.subcategory,
  };
}

function useProjects({ categoryId, subcategoryId, sort = "latest", page = 1, size = 20, keyword }: FetchParams) {
  const [data, setData] = useState<ProjectCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const qp = new URLSearchParams();
        if (categoryId) qp.set("ctgrId", categoryId);
        if (subcategoryId) qp.set("subctgrId", subcategoryId);
        if (keyword && keyword.trim()) qp.set("keyword", keyword.trim());
        qp.set("sort", SORT_MAP[sort]);
        qp.set("page", String(page));
        qp.set("size", String(size));

        const url = `/api/v1/projects?${qp.toString()}`;
        const res = await axios.get<PageResult<ApiProjectRow>>(url, { signal: controller.signal });

        const rows = Array.isArray(res.data.items) ? res.data.items : [];
        const mapped = rows.map((r) => mapRow(r, { category: categoryId, subcategory: subcategoryId }));
        setData(mapped);
        setTotal(res.data.total ?? mapped.length);
      } catch (err: any) {
        if (err?.name !== "CanceledError") setError(err);
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => controller.abort();
  }, [categoryId, subcategoryId, sort, page, size, keyword]);

  return { data, total, loading, error };
}

/* ------------------------------ Query Helpers ----------------------------- */

function useQueryState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = (searchParams.get("sort") as SortKey) || "latest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const size = Math.max(1, parseInt(searchParams.get("size") || "20", 10));
  const keyword = searchParams.get("keyword") || "";

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(searchParams);
    if (v && v.length) next.set(k, v); else next.delete(k);
    setSearchParams(next, { replace: true });
  };

  const updateSort = (s: SortKey) => setParam("sort", s);
  const updatePage = (p: number) => setParam("page", String(p));
  const updateSize = (s: number) => setParam("size", String(s));
  const updateKeyword = (q: string) => { setParam("keyword", q); setParam("page", "1"); };

  return { sort, page, size, keyword, updateSort, updatePage, updateSize, updateKeyword };
}

function Pagination({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (p: number) => void }) {
  const lastPage = Math.max(1, Math.ceil(total / size));
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</Button>
      <span className="text-sm text-gray-600">{page} / {lastPage}</span>
      <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>다음</Button>
    </div>
  );
}

function KeywordBar({ value, onSearch }: { value: string; onSearch: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <div className="mb-4 flex gap-2">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="검색어를 입력하세요" className="w-full border rounded-md px-3 py-2" />
      <Button onClick={() => onSearch(text)}>검색</Button>
    </div>
  );
}

/* --------------------------------- Pages --------------------------------- */

export function ProjectsAllPage() {
  const { sort, page, size, keyword, updateSort, updatePage, updateKeyword } = useQueryState();
  const { data, total, loading, error } = useProjects({ sort, page, size, keyword });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Crumbs />
      <CategoryChips activeCategory="all" />
      <KeywordBar value={keyword} onSearch={updateKeyword} />
      <SortBar value={sort} onChange={updateSort} total={total} />
      {loading && <p className="text-gray-500">불러오는 중…</p>}
      {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
      {!loading && !error && <ProjectGrid items={data} />}
      <Pagination page={page} size={size} total={total} onPage={updatePage} />
    </div>
  );
}

export function ProjectsByCategoryPage() {
  const { categoryId } = useParams<{ categoryId: CategoryKey }>();
  if (!categoryId) return null;

  const { sort, page, size, keyword, updateSort, updatePage, updateKeyword } = useQueryState();
  const { data, total, loading, error } = useProjects({ categoryId: categoryId as CategoryKey, sort, page, size, keyword });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Crumbs categoryId={categoryId as CategoryKey} />
      <CategoryChips activeCategory={categoryId as CategoryKey} />
      <SubcategoryTabs categoryId={categoryId as CategoryKey} />
      <KeywordBar value={keyword} onSearch={updateKeyword} />
      <SortBar value={sort} onChange={updateSort} total={total} />
      {loading && <p className="text-gray-500">불러오는 중…</p>}
      {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
      {!loading && !error && <ProjectGrid items={data} />}
      <Pagination page={page} size={size} total={total} onPage={updatePage} />
    </div>
  );
}

export function ProjectsBySubcategoryPage() {
  const { categoryId, subcategoryId } = useParams<{ categoryId: CategoryKey; subcategoryId: SubcategoryKey }>();
  if (!categoryId || !subcategoryId) return null;

  const { sort, page, size, keyword, updateSort, updatePage, updateKeyword } = useQueryState();
  const { data, total, loading, error } = useProjects({ categoryId: categoryId as CategoryKey, subcategoryId: subcategoryId as SubcategoryKey, sort, page, size, keyword });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Crumbs categoryId={categoryId as CategoryKey} subcategoryId={subcategoryId as SubcategoryKey} />
      <CategoryChips activeCategory={categoryId as CategoryKey} />
      <SubcategoryTabs categoryId={categoryId as CategoryKey} activeSub={subcategoryId as SubcategoryKey} />
      <KeywordBar value={keyword} onSearch={updateKeyword} />
      <SortBar value={sort} onChange={updateSort} total={total} />
      {loading && <p className="text-gray-500">불러오는 중…</p>}
      {error && <p className="text-red-600">목록을 불러오지 못했습니다.</p>}
      {!loading && !error && <ProjectGrid items={data} />}
      <Pagination page={page} size={size} total={total} onPage={updatePage} />
    </div>
  );
}

/* ------------------------------ Route Sample ----------------------------- */
/**
 * <Routes>
 *   <Route path="/projects" element={<ProjectsAllPage />} />
 *   <Route path="/projects/c/:categoryId" element={<ProjectsByCategoryPage />} />
 *   <Route path="/projects/c/:categoryId/s/:subcategoryId" element={<ProjectsBySubcategoryPage />} />
 * </Routes>
 */

export default ProjectsAllPage;
