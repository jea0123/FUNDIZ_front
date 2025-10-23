import React, { useState } from "react";

export type LoginPageProps = {
  onSignIn?: (args: { login: string; password: string; remember: boolean }) => void | Promise<void>;
  onForgotPassword?: () => void;
  onGoogleSignIn?: () => void;
  onSignUp?: () => void;
  loading?: boolean;
};

export default function LoginPage2({
  onSignIn,
  onForgotPassword,
  onSignUp,
  loading = false,
}: LoginPageProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    await onSignIn?.({ login, password, remember });
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 bg-white"
        >
          {/* Title (optional) */}
          {/* <h1 className="text-xl font-semibold text-slate-900 mb-6">Welcome back</h1> */}

          {/* Login input */}
          <label htmlFor="login" className="block text-[13px] font-medium text-slate-700 mb-1">
            Login
          </label>
          <input
            id="login"
            name="login"
            autoComplete="username"
            placeholder="Email or phone number"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="mb-5 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-[15px] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            type="text"
          />

          {/* Password input */}
          <label htmlFor="password" className="block text-[13px] font-medium text-slate-700 mb-1">
            Password
          </label>
          <div className="relative mb-4">
            <input
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPw ? "text" : "password"}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-[15px] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200"
            >
              <EyeIcon className="h-5 w-5 text-slate-600" crossed={showPw} />
            </button>
          </div>

          <div className="mb-5 flex items-center justify-between gap-2">
            {/* Toggle */}
            <label className="inline-flex cursor-pointer select-none items-center gap-3">
              <span className="relative inline-flex h-6 w-11 items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="absolute h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-blue-500"></span>
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-5"></span>
              </span>
              <span className="text-[14px] text-slate-700">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => onForgotPassword?.()}
              className="text-[14px] font-medium text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Primary Sign in */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500">Or sign in with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[13px] text-slate-600">
            Don’t have an account?{" "}
            <button
              type="button"
              className="font-semibold text-blue-600 hover:underline"
              onClick={() => onSignUp?.()}
            >
              Sign up now
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

function EyeIcon({ className, crossed }: { className?: string; crossed?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={crossed ? 0.55 : 1}
      />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      {crossed && (
        <path d="M3.5 20.5 20.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}
