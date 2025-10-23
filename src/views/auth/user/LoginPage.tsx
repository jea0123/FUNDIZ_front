import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type SignInRequestDto from "@/api/request/auth/SignInRequestDto.dto";
import { endpoints, postData } from "@/api/apis";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [, setCookie] = useCookies();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        if (!email || !password) {
            alert("이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }
        setIsLoading(true);
        const body: SignInRequestDto = { email, password };
        try {
            const res = await postData(endpoints.signIn, body);
            signInResponse(res);
        } finally {
            setIsLoading(false);
        }
    };

    const signInResponse = (response: any) => {
        if (!response) {
            alert("알 수 없는 오류가 발생했습니다.");
            return;
        }
        const { status, data: token } = response as { status: number; data: string };
        if (status === 200 || status === 201) {
            try {
                const [, payloadBase64] = token.split(".");
                const { exp } = JSON.parse(atob(payloadBase64)) as { exp: number };
                const expires = new Date(exp * 1000);
                setCookie("accessToken", token, {
                    path: "/",
                    expires,
                    sameSite: "lax",
                    secure: false,
                });
            } catch {
                setCookie("accessToken", token, { path: "/", sameSite: "lax", secure: false });
            }
            alert("로그인에 성공했습니다.");
            navigate("/", { replace: true });
            return;
        }
        if (status === 400) {
            alert("이메일 또는 비밀번호가 잘못되었습니다.");
            return;
        }
        if (status === 0) {
            alert("서버 응답이 없습니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
    };

    return (
        <div className="h-[700px] w-full bg-white flex items-center justify-center">
            <div className="w-full max-w-[480px]">
                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8 bg-white"
                >
                    <h1 className="text-xl font-semibold text-slate-900 mb-6">로그인</h1>

                    <label htmlFor="email" className="block text-[13px] font-medium text-slate-700 mb-1">
                        이메일
                    </label>
                    <Input id="email" name="email" autoComplete="username" placeholder="example@email.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="mb-5 w-full border border-slate-300 bg-slate-50/50 px-4 py-3 text-[15px] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 h-11"
                        type="email" required
                    />

                    <label htmlFor="password" className="block text-[13px] font-medium text-slate-700 mb-1">
                        비밀번호
                    </label>
                    <div className="relative mb-4">
                        <Input id="password" name="password" autoComplete="current-password" placeholder="비밀번호를 입력하세요"
                            value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"}
                            className="w-full border border-slate-300 bg-slate-50/50 px-4 py-3 text-[15px] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 pr-12 h-11"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((v) => !v)}
                            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보이기"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200"
                        >
                            {showPw ? <EyeOff className="h-5 w-5 text-slate-600" /> : <Eye className="h-5 w-5 text-slate-600" />}
                        </button>
                    </div>

                    <div className="mb-5 flex items-center justify-between gap-2">
                        <label className="inline-flex cursor-pointer select-none items-center gap-3">
                            <span className="relative inline-flex h-6 w-11 items-center">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                />
                                <span className="absolute h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-blue-500" />
                                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-5" />
                            </span>
                            <span className="text-[14px] text-slate-700">로그인 상태 유지</span>
                        </label>

                        <button
                            type="button"
                            onClick={() => navigate("/forgot")}
                            className="text-[14px] font-medium text-blue-600 hover:underline"
                        >
                            아이디/비밀번호 찾기
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="mt-1 inline-flex w-full items-center justify-centerl bg-blue-600 px-4 py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60"
                    >
                        {isLoading ? "로그인 중…" : "로그인"}
                    </Button>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs text-slate-500">또는</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <p className="mt-6 text-center text-[13px] text-slate-600">
                        아직 계정이 없나요?{" "}
                        <button
                            type="button"
                            className="font-semibold text-blue-600 hover:underline"
                            onClick={() => navigate("/auth/register")}
                        >
                            회원가입하기
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
