import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
    onLogin: (userData: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            const userData = {
                id: '1',
                name: '홍길동',
                email: email,
                role: 'admin',
            };
            onLogin(userData);
            setIsLoading(false);
            navigate('/');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8" style={{ marginBottom: '200px' }}>
                <div className="text-center">
                    <h2 className="text-3xl mb-2">로그인</h2>
                    <p className="text-gray-600">계정에 로그인하여 프로젝트를 후원해보세요</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>이메일로 로그인</CardTitle>
                        <CardDescription>
                            아직 계정이 없으신가요?{' '}
                            <button
                                onClick={() => navigate('/register')}
                                className="text-blue-600 hover:underline"
                            >
                                회원가입하기
                            </button>
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">이메일</Label>
                                <div className="relative" style={{marginTop: '10px'}}>
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password">비밀번호</Label>
                                <div className="relative" style={{marginTop: '10px'}}>
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        로그인 상태 유지
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <button
                                        type="button"
                                        className="text-blue-600 hover:underline"
                                    >
                                        아이디/비밀번호 찾기
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? '로그인 중...' : '로그인'}
                            </Button>
                        </form>

                        <div className="mt-6">
                            <Separator className="my-4" />
                            <div className="text-center text-sm text-gray-600 mb-4">
                                또는 다른 방법으로 로그인
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}