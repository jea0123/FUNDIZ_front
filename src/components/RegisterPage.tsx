import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { endpoints, postData } from '@/api/apis';
import type SignUpRequestDto from '@/api/request/auth/SignUpRequestDto.dto';

export function RegisterPage() {
    const [formData, setFormData] = useState({ email: '', nickname: '', password: '', confirmPassword: '' });
    const [emailChecked, setEmailChecked] = useState(false);
    const [nicknameChecked, setNicknameChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreements, setAgreements] = useState({ terms: false, privacy: false, marketing: false });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAgreementChange = (field: string, checked: boolean) => {
        setAgreements(prev => ({ ...prev, [field]: checked }));
    };

    const handleEmailDuplicateCheck = async () => {
        const res = await postData(endpoints.checkEmail, { email: formData.email });
        if (res.status === 200) {
            alert('사용 가능한 이메일입니다.');
            setEmailChecked(true);
        } else if (res.status === 409) {
            alert('이미 사용 중인 이메일입니다.');
            setEmailChecked(false);
        } else {
            alert('다시 시도해주세요.');
        }
    };

    const handleNicknameDuplicateCheck = async () => {
        const res = await postData(endpoints.checkNickname, { nickname: formData.nickname });
        if (res.status === 200) {
            alert('사용 가능한 닉네임입니다.');
            setNicknameChecked(true);
        } else if (res.status === 409) {
            alert('이미 사용 중인 닉네임입니다.');
            setNicknameChecked(false);
        } else {
            alert('다시 시도해주세요.');
        }
    };

    const handleSubmit = async () => {
        if (formData.password !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!agreements.terms || !agreements.privacy) {
            alert('필수 약관에 동의해주세요.');
            return;
        }
        setIsLoading(true);
        const requestData: SignUpRequestDto = { email: formData.email, nickname: formData.nickname, password: formData.password };
        try {
            const response = await postData(endpoints.signUp, requestData);
            signUpResponse(response);
        } finally {
            setIsLoading(false);
        }
    };

    const signUpResponse = (response: any) => {
        if (!response) {
            alert('알 수 없는 오류가 발생했습니다.');
            return;
        }
        const { status } = response;
        if (status === 200 || status === 201) {
            alert('회원가입이 완료되었습니다.');
            navigate('/login', { replace: true });
            return;
        } else if (status === 409) {
            alert('이미 가입된 이메일입니다.');
            return;
        } else if (status === 0) {
            alert('서버 응답이 없습니다. 잠시 후 다시 시도해주세요.');
            return;
        } else {
            alert('회원가입에 실패했습니다. 다시 시도해주세요.');
            return;
        }
    };

    const isFormValid = () => {
        return (
            formData.nickname &&
            formData.email &&
            formData.password &&
            formData.confirmPassword &&
            agreements.terms &&
            agreements.privacy &&
            emailChecked &&
            nicknameChecked
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8" style={{ marginBottom: '200px' }}>
                <div className="text-center">
                    <h2 className="text-3xl mb-2">회원가입</h2>
                    <p className="text-gray-600">크라우드펀딩 플랫폼에 오신 것을 환영합니다</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>계정 만들기</CardTitle>
                        <CardDescription>이미 계정이 있으신가요?{' '}
                            <button onClick={() => navigate('/login')}
                                className="text-blue-600 hover:underline cursor-pointer"
                            >
                                로그인하기
                            </button>
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email">이메일 *</Label>
                                <div className="relative" style={{ marginTop: '10px' }}>
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="pl-10 w-9/12"
                                        required
                                    />
                                    <Button type="button" className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 bg-white border border-gray-300 rounded-md px-2 py-1 cursor-pointer"
                                        variant="ghost"
                                        onClick={handleEmailDuplicateCheck}>
                                        중복 확인
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="nickname">닉네임 *</Label>
                                <div className="relative" style={{ marginTop: '10px' }}>
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="nickname"
                                        type="text"
                                        placeholder="닉네임을 입력하세요"
                                        value={formData.nickname}
                                        onChange={(e) => handleInputChange('nickname', e.target.value)}
                                        className="pl-10 w-9/12"
                                        required
                                    />
                                    <Button type="button" className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 bg-white border border-gray-300 rounded-md px-2 py-1 cursor-pointer"
                                        variant="ghost"
                                        onClick={handleNicknameDuplicateCheck}>
                                        중복 확인
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password">비밀번호 *</Label>
                                <div className="relative" style={{ marginTop: '10px' }}>
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="8자 이상 입력하세요"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                                <div className="relative" style={{ marginTop: '10px' }}>
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="비밀번호를 다시 입력하세요"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={agreements.terms}
                                        onCheckedChange={(checked: any) => handleAgreementChange('terms', !!checked)}
                                    />
                                    <label htmlFor="terms" className="text-sm">
                                        <span className="text-red-500">*</span> 이용약관에 동의합니다{' '}
                                        <button type="button" className="text-blue-600 hover:underline cursor-pointer">
                                            [보기]
                                        </button>
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="privacy"
                                        checked={agreements.privacy}
                                        onCheckedChange={(checked: any) => handleAgreementChange('privacy', !!checked)}
                                    />
                                    <label htmlFor="privacy" className="text-sm">
                                        <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다{' '}
                                        <button type="button" className="text-blue-600 hover:underline cursor-pointer">
                                            [보기]
                                        </button>
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="marketing"
                                        checked={agreements.marketing}
                                        onCheckedChange={(checked: any) => handleAgreementChange('marketing', !!checked)}
                                    />
                                    <label htmlFor="marketing" className="text-sm">
                                        마케팅 정보 수신에 동의합니다 (선택){' '}
                                        <button type="button" className="text-blue-600 hover:underline cursor-pointer">
                                            [보기]
                                        </button>
                                    </label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                onClick={handleSubmit}
                                disabled={!isFormValid() || isLoading}
                            >
                                {isLoading ? '회원가입 중...' : '회원가입'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}