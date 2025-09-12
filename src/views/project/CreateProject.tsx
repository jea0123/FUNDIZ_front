import { useEffect, useState } from 'react';
import { Upload, Plus, X, Save, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import type { ProjectCreateRequestDto } from '@/types/projects';
import { endpoints, getData, postData } from '@/api/apis';
import type { RewardCreateRequestDto } from '@/types/reward';
import type { SubcategoryDto } from '@/types/subcategory';
import { formatDate } from '@/utils/utils';

const STEPS = [
    { id: 1, title: '프로젝트 정보', description: '기본 정보 입력' },
    { id: 2, title: '펀딩 설정', description: '목표 금액 및 기간 설정' },
    { id: 3, title: '리워드 설계', description: '후원자 리워드 구성' },
    { id: 4, title: '정책 및 정보', description: '환불 정책 및 크리에이터 정보' },
    { id: 5, title: '검토 및 제출', description: '최종 검토 후 심사 요청' },
];

const formatCurrency = (amount: string) => {
    const num = parseInt(amount.replace(/[^0-9]/g, ''));
    return new Intl.NumberFormat('ko-KR').format(num);
};

export function CreateProject() {
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    //리워드 임시 id
    type RewardForm = RewardCreateRequestDto & { tempId: string };

    //서버 전송용
    const [project, setProject] = useState<ProjectCreateRequestDto>({
        projectId: 0,
        creatorId: 0,
        subctgrId: 0,
        title: "",
        content: "",
        thumbnail: "",
        goalAmount: 0,
        startDate: new Date(),
        endDate: new Date(),
        tagList: [],
        rewardList: [],
        creatorName: "",
        businessNum: "",
        email: "",
        phone: ""
    });

    const [rewardList, setRewardList] = useState<RewardForm[]>([]);
    const [subcategories, setSubcategories] = useState<SubcategoryDto[]>([]);

    const [newTag, setNewTag] = useState('');
    const [newReward, setNewReward] = useState<RewardCreateRequestDto>({
        rewardName: '',
        price: 0,
        rewardContent: '',
        deliveryDate: new Date(),
        rewardCnt: 0,
        isPosting: 'N'
    });

    const getSubcategories = async () => {
        const response = await getData(endpoints.getSubcategories);
        if (response.status === 200) setSubcategories(response.data.subcategoryList);
        console.log(response);
    };

    useEffect(() => {
        getSubcategories();
    }, []);

    const handleInputChange = (key: keyof ProjectCreateRequestDto, value: any) =>
        setProject(prev => ({
            ...prev,
            [key]: key === 'subctgrId' || key === 'goalAmount' ? Number(value) : value
        }));

    //리워드 임시 id 생성
    const genId = () => Math.random().toString(36).slice(2, 10);

    //태그 추가
    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag) return; //빈 문자열 체크
        setProject(prev => {
            const next = Array.from(new Set([...(prev.tagList || []), trimmedTag])); // 중복 체크
            if (next.length > 10) return prev; // 최대 10개
            return { ...prev, tagList: next };
        });
    };

    //태그 삭제 (태그 이름 기준)
    const removeTag = (tag: string) => {
        setProject(prev => ({
            ...prev,
            tagList: (prev.tagList || []).filter(t => t !== tag)
        }));
    };

    //리워드 추가
    const addReward = () => {
        const rewardWithId: RewardForm = { ...newReward, tempId: genId() };
        setRewardList(prev => [...prev, rewardWithId]);
    };

    //리워드 삭제
    const removeReward = (tempId: string) => {
        setRewardList(prev => prev.filter(r => r.tempId !== tempId));
    };

    const nextStep = () => currentStep < STEPS.length && setCurrentStep(currentStep + 1);

    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const createProjectResponse = (response: any) => {
        if (!response) {
            alert('알 수 없는 오류가 발생했습니다.');
            return;
        }
        const { status } = response;
        if (status === 200 || status === 201) {
            alert('프로젝트가 심사를 위해 제출되었습니다.');
            navigate('/');
            return;
        } else if (status === 400) {
            alert('입력한 정보가 올바르지 않습니다. 다시 확인해주세요.');
            return;
        } else if (status === 0) {
            alert('서버 응답이 없습니다. 잠시 후 다시 시도해주세요.');
            return;
        } else {
            alert('프로젝트 제출에 실패했습니다. 다시 시도해주세요.');
            return;
        }
    };

    //리워드 유효성 검사
    const isValidReward = (reward: RewardCreateRequestDto) => {
        return (
            reward.rewardName.trim().length > 0 &&
            reward.price > 0 &&
            reward.rewardContent.trim().length > 0 &&
            reward.deliveryDate instanceof Date &&
            !isNaN(reward.deliveryDate.getTime()) &&
            (reward.isPosting === 'Y' || reward.isPosting === 'N')
        );
    };

    const submit = async () => {
        //필수 입력 항목 검사
        if (!project.title || !project.content || !project.thumbnail || project.goalAmount <= 0 ||
            !project.startDate || !project.endDate || project.tagList.length === 0 || project.rewardList.length === 0) {
            alert('필수 입력 항목을 모두 채워주세요.');
            return;
        }

        //날짜 유효성 검사
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            alert('프로젝트 시작일과 종료일을 올바르게 입력해주세요.');
            return;
        }
        if (start > end) {
            alert('프로젝트 시작일은 종료일보다 이전이어야 합니다.');
            return;
        }

        //리워드 유효성 검사
        const invalid = rewardList.find(r => !isValidReward(r));
        if (invalid) {
            alert('리워드 정보를 올바르게 입력해주세요.');
            return;
        }

        //서버 전송용 payload 구성
        //리워드 tempId 제거
        const payload: ProjectCreateRequestDto = {
            ...project,
            rewardList: rewardList.map(({ tempId, ...rest }) => rest)
        };

        setIsLoading(true);
        try {
            const response = await postData(endpoints.createProject, payload);
            createProjectResponse(response);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="category">카테고리 *</Label>
                            <Select
                                value={project.subctgrId ? String(project.subctgrId) : undefined}
                                onValueChange={(value) =>
                                    setProject(prev => ({ ...prev, subctgrId: Number(value) }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="서브카테고리를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subcategories?.map(sc => (
                                        <SelectItem key={sc.subctgrId} value={String(sc.subctgrId)}>
                                            {sc.subctgrName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="title">프로젝트 제목 *</Label>
                            <Input
                                id="title"
                                placeholder="프로젝트 제목을 입력하세요"
                                value={project.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                maxLength={50}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {project.title.length}/50자
                            </p>
                        </div>

                        {/* TODO: 프로젝트 간단 설명
                        <div>
                            <Label htmlFor="description">프로젝트 설명 *</Label>
                            <Textarea
                                id="description"
                                placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                                value={project.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                maxLength={200}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {projectData.description.length}/200자
                            </p>
                        </div>
                        */}

                        <div>
                            <Label>썸네일 이미지 *</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                                <Button variant="outline" size="sm">
                                    파일 선택
                                </Button>
                                <p className="text-xs text-gray-400 mt-2">
                                    권장 크기: 1200x800px, 최대 5MB (JPG, PNG)
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label>검색 태그 (최대 10개)</Label>
                            <div className="flex space-x-2 mb-2">
                                <Input
                                    placeholder="태그 입력"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag(newTag);
                                            setNewTag('');
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => { addTag(newTag); setNewTag(''); }}
                                    variant="outline"
                                >
                                    추가
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {project.tagList.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                                        {tag}
                                        <X
                                            className="h-3 w-3 ml-1"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="goalAmount">목표 금액 *</Label>
                            <Input
                                id="goalAmount"
                                placeholder="목표 금액을 입력하세요"
                                value={project.goalAmount}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    handleInputChange('goalAmount', value);
                                }}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {project.goalAmount && `${formatCurrency(project.goalAmount.toString())}원`}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startDate">펀딩 시작일 *</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={project.startDate.toDateString()}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate">펀딩 종료일 *</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={project.endDate.toDateString()}
                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* TODO: 예상 발송 시작일
                        <div>
                            <Label htmlFor="deliveryDate">예상 발송 시작일 *</Label>
                            <Input
                                id="deliveryDate"
                                type="date"
                                value={project.deliveryDate.toDateString}
                                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                펀딩 성공 시 리워드를 발송할 예상 날짜입니다.
                            </p>
                        </div>
                        */}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">펀딩 수수료 안내</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>플랫폼 수수료</span>
                                        <span>5%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>결제 수수료</span>
                                        <span>3%</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-semibold">
                                        <span>총 수수료</span>
                                        <span>8%</span>
                                    </div>
                                    {project.goalAmount && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded">
                                            <p>목표 달성 시 예상 수익: {formatCurrency((project.goalAmount * 0.92).toString())}원</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">리워드 추가</h3>
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="rewardAmount">후원 금액 *</Label>
                                            <Input
                                                id="rewardAmount"
                                                placeholder="10000"
                                                value={newReward.price}
                                                onChange={(e) => setNewReward({ ...newReward, price: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="rewardQuantity">제한 수량 (선택)</Label>
                                            <Input
                                                id="rewardQuantity"
                                                placeholder="100"
                                                value={newReward.rewardCnt}
                                                onChange={(e) => setNewReward({ ...newReward, rewardCnt: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="rewardTitle">리워드명 *</Label>
                                        <Input
                                            id="rewardTitle"
                                            placeholder="얼리버드 패키지"
                                            value={newReward.rewardName}
                                            onChange={(e) => setNewReward({ ...newReward, rewardName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rewardDescription">리워드 설명 *</Label>
                                        <Textarea
                                            id="rewardDescription"
                                            placeholder="리워드 구성품과 혜택을 설명하세요"
                                            value={newReward.rewardContent}
                                            onChange={(e) => setNewReward({ ...newReward, rewardContent: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="deliveryDate">배송 시작 예정일 *</Label>
                                        <Input
                                            id="deliveryDate"
                                            type="date"
                                            value={formatDate(newReward.deliveryDate)}
                                            onChange={(e) => setNewReward({ ...newReward, deliveryDate: new Date(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="isPosting">배송 필요 여부 *</Label>
                                        <select
                                            id="isPosting"
                                            className="border rounded w-full p-2"
                                            value={newReward.isPosting}
                                            onChange={(e) => setNewReward({ ...newReward, isPosting: e.target.value })}
                                        >
                                            <option value="Y">배송 필요</option>
                                            <option value="N">배송 불필요</option>
                                        </select>
                                    </div>
                                    <Button onClick={addReward} className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        리워드 추가
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">추가된 리워드</h3>
                            <div className="space-y-4">
                                {rewardList.map((reward) => (
                                    <Card key={reward.tempId}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="text-lg font-semibold">
                                                            {formatCurrency(reward.price.toString())}원
                                                        </span>
                                                        {reward.rewardCnt > 0 && (
                                                            <Badge variant="secondary">한정 {reward.rewardCnt}개</Badge>
                                                        )}
                                                    </div>
                                                    <h4 className="font-medium mb-1">{reward.rewardName}</h4>
                                                    <p className="text-sm text-gray-600">{reward.rewardContent}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeReward(reward.tempId)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {project.rewardList.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">
                                        아직 추가된 리워드가 없습니다.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        {/* TODO: 환불 및 A/S 정책
                        <div>
                            <Label htmlFor="refundPolicy">환불 정책 *</Label>
                            <Textarea
                                id="refundPolicy"
                                placeholder="환불 정책을 입력하세요"
                                value={projectData.refundPolicy}
                                onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                                rows={4}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                후원자를 위한 환불 조건과 절차를 명시해주세요.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="asPolicy">A/S 정책 (선택)</Label>
                            <Textarea
                                id="asPolicy"
                                placeholder="A/S 정책을 입력하세요"
                                value={projectData.asPolicy}
                                onChange={(e) => handleInputChange('asPolicy', e.target.value)}
                                rows={3}
                            />
                        </div>
                        */}

                        <Card>
                            <CardHeader>
                                <CardTitle>창작자 정보</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="creatorName">창작자명 *</Label>
                                    <Input
                                        id="creatorName"
                                        placeholder="개인명 또는 단체명"
                                        value={project.creatorName}
                                        onChange={(e) => handleInputChange('creatorName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="businessNum">사업자등록번호 *</Label>
                                    <Input
                                        id="businessNum"
                                        placeholder="000-00-00000"
                                        value={project.businessNum}
                                        onChange={(e) => handleInputChange('businessNum', e.target.value)}
                                        inputMode="numeric"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">문의 이메일 *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="contact@example.com"
                                        value={project.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">문의 전화번호 *</Label>
                                    <Input
                                        id="phone"
                                        placeholder="010-0000-0000"
                                        value={project.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>프로젝트 요약</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-700">카테고리</h4>
                                        <p>{subcategories.find(sc => sc.subctgrId === project.subctgrId)?.subctgrName || '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-700">목표 금액</h4>
                                        <p>{project.goalAmount ? formatCurrency(project.goalAmount.toString()) + '원' : '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-700">펀딩 기간</h4>
                                        <p>{project.startDate && project.endDate ?
                                            `${project.startDate instanceof Date ? formatDate(project.startDate) : project.startDate} ~ ${project.endDate instanceof Date ? formatDate(project.endDate) : project.endDate}` : '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-700">리워드 개수</h4>
                                        <p>{project.rewardList.length}개</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700">프로젝트 제목</h4>
                                    <p>{project.title || '-'}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700">창작자</h4>
                                    <p>{project.creatorName || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>심사 안내</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <p>• 프로젝트 심사는 영업일 기준 3-5일 소요됩니다.</p>
                                    <p>• 심사 결과는 등록된 이메일로 안내드립니다.</p>
                                    <p>• 심사 승인 후 펀딩 시작일에 자동으로 공개됩니다.</p>
                                    <p>• 심사 반려 시 수정 후 재제출이 가능합니다.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="agree" />
                            <label htmlFor="agree" className="text-sm">
                                프로젝트 등록 약관 및 정책에 동의합니다. *
                            </label>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="loader mb-4"></div>
                    <p className="text-gray-600">프로젝트를 제출하는 중입니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl mb-6">프로젝트 만들기</h1>
                <div className="flex items-center justify-between mb-4">
                    {STEPS.map((step: { id: number; title: string; description: string }, index: number) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}
                            >
                                {step.id}
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`w-16 h-1 mx-2 ${
                                        currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">{STEPS[currentStep - 1].title}</h2>
                    <p className="text-gray-600">{STEPS[currentStep - 1].description}</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    {renderStep()}
                </CardContent>
            </Card>

            <div className="flex justify-between mt-8">
                <div>
                    {currentStep > 1 && (
                        <Button variant="outline" onClick={prevStep}>
                            이전
                        </Button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <Save className="h-4 w-4 mr-2" />
                        임시저장
                    </Button>
                    {currentStep < STEPS.length ? (
                        <Button onClick={nextStep}>
                            다음
                        </Button>
                    ) : (
                        <Button onClick={submit}>
                            <Send className="h-4 w-4 mr-2" />
                            심사 요청
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}