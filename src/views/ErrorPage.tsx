import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

/**
 * @description 에러 페이지 컴포넌트
 * @returns {JSX.Element} 에러 페이지 JSX 요소
 */
export default function ErrorPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as { message?: string; status?: number } | null) || {};

    const title = "문제가 발생했어요";
    const message = state.message || "존재하지 않는 페이지이거나, 일시적인 오류가 발생했을 수 있어요.";
    const status = state.status || 404;
    const canGoBack = typeof window !== "undefined" && window.history.length > 1;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-6">
            <div className="max-w-xl w-full text-center">
                <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 140, damping: 14 }}
                    className="p-8 rounded-2xl border bg-card shadow-sm"
                >
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            initial={{ y: -6 }}
                            animate={{ y: 0 }}
                            transition={{ repeat: 1, repeatType: "reverse", duration: 0.25 }}
                            aria-hidden
                        >
                            <AlertTriangle className="h-12 w-12" />
                        </motion.div>

                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        {status ? (
                            <p className="text-sm text-muted-foreground">오류 코드: {status}</p>
                        ) : null}
                        <p className="text-muted-foreground whitespace-pre-wrap">{message}</p>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => (canGoBack ? navigate(-1) : navigate("/"))}
                                className="gap-2"
                                aria-label="뒤로가기"
                            >
                                <ArrowLeft className="h-4 w-4" /> 뒤로가기
                            </Button>

                            <Button asChild className="gap-2" aria-label="홈으로">
                                <Link to="/">
                                    <Home className="h-4 w-4" /> 홈으로
                                </Link>
                            </Button>
                        </div>

                        {/* 개발 환경에서만, 전달된 state 확인용 */}
                        {import.meta?.env?.DEV && (state.message || state.status) ? (
                            <details className="mt-6 w-full text-left">
                                <summary className="text-sm text-muted-foreground cursor-pointer">
                                    전달된 에러 상태 보기
                                </summary>
                                <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs">
                                    {JSON.stringify(state, null, 2)}
                                </pre>
                            </details>
                        ) : null}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
