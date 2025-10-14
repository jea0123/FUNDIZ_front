import { useState } from 'react';
import { Lock, Eye, EyeOff, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { endpoints, postData } from '@/api/apis';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AdminRegisterPage() {
    const [formData, setFormData] = useState({ adminId: '', adminPwd: '', confirmPwd: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (formData.adminPwd !== formData.confirmPwd) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        setIsLoading(true);
        const requestBody = { adminId: formData.adminId, password: formData.adminPwd };
        try {
            const response = await postData(endpoints.registerAdmin, requestBody);
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
            navigate('/auth/login', { replace: true });
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
            formData.adminId.trim() !== '' &&
            formData.adminPwd.trim() !== '' &&
            formData.confirmPwd.trim() !== '' &&
            formData.adminPwd === formData.confirmPwd
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8" style={{ marginBottom: '200px' }}>
                <div className="text-center">
                    <h2 className="text-3xl mb-2">관리자 회원가입</h2>
                </div>

                <Card>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="adminId">아이디 *</Label>
                                <div className="relative" style={{ marginTop: '10px' }}>
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="adminId"
                                        placeholder="아이디를 입력해주세요"
                                        value={formData.adminId}
                                        onChange={(e) => handleInputChange('adminId', e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
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
                                        value={formData.adminPwd}
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
                                        value={formData.confirmPwd}
                                        onChange={(e) => handleInputChange('confirmPwd', e.target.value)}
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