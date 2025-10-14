import { useState } from 'react';
import { Lock, Eye, EyeOff, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { endpoints, postData } from '@/api/apis';
import { useCookies } from 'react-cookie';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AdminLoginPage() {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [, setCookie] = useCookies();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!adminId || !password) {
            alert('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }
        const requestBody = { adminId, password };
        try {
            const response = await postData(endpoints.loginAdmin, requestBody);
            signInResponse(response);
        } finally {
            setIsLoading(false);
        }
    };

    const signInResponse = (response: any) => {
        if (!response) {
            alert('알 수 없는 오류가 발생했습니다.');
            return;
        }
        const { status, data: token } = response;
        if (status === 200 || status === 201) {
            const [, payloadBase64] = token.split('.');
            const { exp } = JSON.parse(atob(payloadBase64)) as { exp: number };
            const expires = new Date(exp * 1000);
            setCookie('accessToken', token, { path: '/', expires, sameSite: 'lax', secure: false });
            alert('로그인에 성공했습니다.');
            navigate('/', { replace: true });
            return;
        } else if (status === 400) {
            alert('이메일 또는 비밀번호가 잘못되었습니다.');
            return;
        } else if (status === 0) {
            alert('서버 응답이 없습니다. 잠시 후 다시 시도해주세요.');
            return;
        } else {
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
            return;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8" style={{ marginBottom: '200px' }}>
                <div className="text-center">
                    <h2 className="text-3xl mb-2">관리자 로그인</h2>
                </div>
                <Card>
                    <CardContent>
                        <div onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="adminId">아이디</Label>
                                <div className="relative" style={{ marginTop: '10px' }}>
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="adminId"
                                        placeholder="아이디를 입력하세요"
                                        value={adminId}
                                        onChange={(e) => setAdminId(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password">비밀번호</Label>
                                <div className="relative" style={{ marginTop: '10px' }}>
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="비밀번호를 입력하세요"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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

                            <Button type="submit" className="w-full" disabled={isLoading} onClick={handleSubmit}>
                                {isLoading ? '로그인 중...' : '로그인'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}