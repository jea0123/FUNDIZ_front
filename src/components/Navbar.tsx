import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Heart, User, Bell, Menu, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useLoginUserStore } from '@/store/LoginUserStore.store';
import { useCookies } from 'react-cookie';

export function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [ ,setCookie] = useCookies(['accessToken']);
    const { loginUser, resetLoginUser } = useLoginUserStore();
    const navigate = useNavigate();

    const logoutHandler = () => {
        alert('로그아웃 되었습니다.');
        navigate('/');
        resetLoginUser();
        setCookie('accessToken', '', { path: '/', expires: new Date() })
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => navigate('/')}
                            className="text-2xl font-bold text-blue-600"
                        >
                            CrowdFund
                        </button>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="프로젝트, 크리에이터 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {loginUser ? (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                                    프로젝트 둘러보기
                                </Button>

                                {(loginUser.role === 'creator' || loginUser.role === 'admin') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate('/create')}
                                    >
                                        프로젝트 만들기
                                    </Button>
                                )}

                                {loginUser.role === 'admin' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate('/admin')}
                                    >
                                        관리자
                                    </Button>
                                )}

                                <Button variant="ghost" size="sm">
                                    <Heart className="h-4 w-4" />
                                </Button>

                                <Button variant="ghost" size="sm">
                                    <Bell className="h-4 w-4" />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="rounded-full">
                                            <User className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate('/mypage')}>
                                            마이페이지
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={logoutHandler}>
                                            로그아웃
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                >
                                    로그인
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => navigate('/register')}
                                >
                                    회원가입
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                <div className="md:hidden pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="프로젝트, 크리에이터 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col space-y-2">
                            {loginUser ? (
                                <>
                                    <Button variant="ghost" onClick={() => navigate('/')}>
                                        프로젝트 둘러보기
                                    </Button>
                                    {(loginUser.role === 'creator' || loginUser.role === 'admin') && (
                                        <Button variant="ghost" onClick={() => navigate('/create')}>
                                            프로젝트 만들기
                                        </Button>
                                    )}
                                    {loginUser.role === 'admin' && (
                                        <Button variant="ghost" onClick={() => navigate('/admin')}>
                                            관리자
                                        </Button>
                                    )}
                                    <Button variant="ghost" onClick={() => navigate('/mypage')}>
                                        마이페이지
                                    </Button>
                                    <Button variant="ghost" onClick={logoutHandler}>
                                        로그아웃
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" onClick={() => navigate('/login')}>
                                        로그인
                                    </Button>
                                    <Button onClick={() => navigate('/register')}>회원가입</Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export function Footer() {
    const navigate = useNavigate();

    return (
        <div style={{padding: '30px'}}>
            <ul style={{listStyle: 'none', textAlign: 'center'}}>
            <li style={{display: 'inline-block', marginRight: '50px'}}><a href="/user/mypage">마이페이지</a></li>
            <li style={{display: 'inline-block', marginRight: '50px'}}><a href="/admin">관리자 대시보드</a></li>
            <li style={{display: 'inline-block'}}><a href="/admin/test2">고객센터 관리</a></li>
            </ul>
        </div>
    );

}
