import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Upload, Plus, X, Save, Send } from 'lucide-react';

interface CreateProjectProps {
  onNavigate: (page: string) => void;
}

export function CreateProject({ onNavigate }: CreateProjectProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState({
    category: '',
    title: '',
    description: '',
    thumbnail: '',
    tags: [] as string[],
    targetAmount: '',
    startDate: '',
    endDate: '',
    deliveryDate: '',
    rewards: [] as any[],
    refundPolicy: '',
    asPolicy: '',
    creatorName: '',
    creatorEmail: '',
    creatorPhone: '',
  });

  const [newTag, setNewTag] = useState('');
  const [newReward, setNewReward] = useState({
    amount: '',
    title: '',
    description: '',
    quantity: '',
  });

  const steps = [
    { id: 1, title: '프로젝트 정보', description: '기본 정보 입력' },
    { id: 2, title: '펀딩 설정', description: '목표 금액 및 기간 설정' },
    { id: 3, title: '리워드 설계', description: '후원자 리워드 구성' },
    { id: 4, title: '정책 및 정보', description: '환불 정책 및 크리에이터 정보' },
    { id: 5, title: '검토 및 제출', description: '최종 검토 후 심사 요청' },
  ];

  const categories = [
    { id: 'tech', name: '테크/가전/리빙' },
    { id: 'fashion', name: '패션/뷰티' },
    { id: 'character', name: '캐릭터/굿즈/디자인' },
    { id: 'food', name: '푸드' },
    { id: 'culture', name: '문화/예술' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag && projectData.tags.length < 10 && !projectData.tags.includes(newTag)) {
      setProjectData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addReward = () => {
    if (newReward.amount && newReward.title) {
      setProjectData(prev => ({
        ...prev,
        rewards: [...prev.rewards, { ...newReward, id: Date.now() }]
      }));
      setNewReward({ amount: '', title: '', description: '', quantity: '' });
    }
  };

  const removeReward = (rewardId: number) => {
    setProjectData(prev => ({
      ...prev,
      rewards: prev.rewards.filter(reward => reward.id !== rewardId)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    alert('프로젝트가 심사를 위해 제출되었습니다.');
    onNavigate('main');
  };

  const formatCurrency = (amount: string) => {
    const num = parseInt(amount.replace(/[^0-9]/g, ''));
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="category">카테고리 *</Label>
              <Select onValueChange={(value: any) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
                value={projectData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={50}
              />
              <p className="text-sm text-gray-500 mt-1">
                {projectData.title.length}/50자
              </p>
            </div>

            <div>
              <Label htmlFor="description">프로젝트 설명 *</Label>
              <Textarea
                id="description"
                placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                value={projectData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">
                {projectData.description.length}/200자
              </p>
            </div>

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
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  추가
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {projectData.tags.map((tag) => (
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
              <Label htmlFor="targetAmount">목표 금액 *</Label>
              <Input
                id="targetAmount"
                placeholder="목표 금액을 입력하세요"
                value={projectData.targetAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange('targetAmount', value);
                }}
              />
              <p className="text-sm text-gray-500 mt-1">
                {projectData.targetAmount && `${formatCurrency(projectData.targetAmount)}원`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">펀딩 시작일 *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={projectData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">펀딩 종료일 *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={projectData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deliveryDate">예상 발송 시작일 *</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={projectData.deliveryDate}
                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                펀딩 성공 시 리워드를 발송할 예상 날짜입니다.
              </p>
            </div>

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
                  {projectData.targetAmount && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p>목표 달성 시 예상 수익: {formatCurrency((parseInt(projectData.targetAmount) * 0.92).toString())}원</p>
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
                        value={newReward.amount}
                        onChange={(e) => setNewReward({...newReward, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rewardQuantity">제한 수량 (선택)</Label>
                      <Input
                        id="rewardQuantity"
                        placeholder="100"
                        value={newReward.quantity}
                        onChange={(e) => setNewReward({...newReward, quantity: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="rewardTitle">리워드명 *</Label>
                    <Input
                      id="rewardTitle"
                      placeholder="얼리버드 패키지"
                      value={newReward.title}
                      onChange={(e) => setNewReward({...newReward, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rewardDescription">리워드 설명 *</Label>
                    <Textarea
                      id="rewardDescription"
                      placeholder="리워드 구성품과 혜택을 설명하세요"
                      value={newReward.description}
                      onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                      rows={3}
                    />
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
                {projectData.rewards.map((reward) => (
                  <Card key={reward.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg font-semibold">
                              {formatCurrency(reward.amount)}원
                            </span>
                            {reward.quantity && (
                              <Badge variant="secondary">한정 {reward.quantity}개</Badge>
                            )}
                          </div>
                          <h4 className="font-medium mb-1">{reward.title}</h4>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReward(reward.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {projectData.rewards.length === 0 && (
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

            <Card>
              <CardHeader>
                <CardTitle>크리에이터 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="creatorName">크리에이터명 *</Label>
                  <Input
                    id="creatorName"
                    placeholder="개인명 또는 단체명"
                    value={projectData.creatorName}
                    onChange={(e) => handleInputChange('creatorName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="creatorEmail">문의 이메일 *</Label>
                  <Input
                    id="creatorEmail"
                    type="email"
                    placeholder="contact@example.com"
                    value={projectData.creatorEmail}
                    onChange={(e) => handleInputChange('creatorEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="creatorPhone">문의 전화번호 *</Label>
                  <Input
                    id="creatorPhone"
                    placeholder="010-0000-0000"
                    value={projectData.creatorPhone}
                    onChange={(e) => handleInputChange('creatorPhone', e.target.value)}
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
                    <p>{categories.find(c => c.id === projectData.category)?.name || '-'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">목표 금액</h4>
                    <p>{projectData.targetAmount ? formatCurrency(projectData.targetAmount) + '원' : '-'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">펀딩 기간</h4>
                    <p>{projectData.startDate && projectData.endDate ? 
                        `${projectData.startDate} ~ ${projectData.endDate}` : '-'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">리워드 개수</h4>
                    <p>{projectData.rewards.length}개</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">프로젝트 제목</h4>
                  <p>{projectData.title || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">크리에이터</h4>
                  <p>{projectData.creatorName || '-'}</p>
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-6">프로젝트 만들기</h1>
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        <div className="mt-4">
          <h2 className="text-xl font-semibold">{steps[currentStep - 1].title}</h2>
          <p className="text-gray-600">{steps[currentStep - 1].description}</p>
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
          {currentStep < steps.length ? (
            <Button onClick={nextStep}>
              다음
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              심사 요청
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}