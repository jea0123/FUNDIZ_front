import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        userType: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreements, setAgreements] = useState({
        terms: false,
        privacy: false,
        marketing: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAgreementChange = (field: string, checked: boolean) => {
        setAgreements(prev => ({ ...prev, [field]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!agreements.terms || !agreements.privacy) {
            alert('필수 약관에 동의해주세요.');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            alert('회원가입이 완료되었습니다. 이메일 인증을 확인해주세요.');
            navigate('/login');
            setIsLoading(false);
        }, 1000);
    };

    const isFormValid = () => {
        return (
            formData.name &&
            formData.email &&
            formData.password &&
            formData.confirmPassword &&
            formData.phone &&
            formData.userType &&
            agreements.terms &&
            agreements.privacy
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8"
                style={{ marginBottom: '200px' }}
            >
                <div className="text-center">
                    <h2 className="text-3xl mb-2">회원가입</h2>
                    <p className="text-gray-600">크라우드펀딩 플랫폼에 오신 것을 환영합니다</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>계정 만들기</CardTitle>
                        <CardDescription>
                            이미 계정이 있으신가요?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-blue-600 hover:underline"
                            >
                                로그인하기
                            </button>
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <Label htmlFor="email">이메일 *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="name">닉네임 *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="닉네임을 입력하세요"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password">비밀번호 *</Label>
                                <div className="relative">
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
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                                <div className="relative">
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
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                                        <button type="button" className="text-blue-600 hover:underline">
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
                                        <button type="button" className="text-blue-600 hover:underline">
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
                                        <button type="button" className="text-blue-600 hover:underline">
                                            [보기]
                                        </button>
                                    </label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={!isFormValid() || isLoading}
                            >
                                {isLoading ? '회원가입 중...' : '회원가입'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}