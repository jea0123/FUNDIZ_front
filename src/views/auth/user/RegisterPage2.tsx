import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { endpoints, postData } from "@/api/apis";
import type SignUpRequestDto from "@/api/request/auth/SignUpRequestDto.dto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastSuccess } from "@/utils/utils";

const RegisterSchema = z
    .object({
        email: z
            .string({ message: "이메일을 입력해주세요." })
            .min(1, "이메일을 입력해주세요.")
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "유효한 이메일 형식이 아닙니다." }),
        nickname: z
            .string({ message: "닉네임을 입력해주세요." })
            .min(2, "닉네임은 2자 이상이어야 해요.")
            .max(10, "닉네임은 10자 이하여야 해요."),
        password: z
            .string({ message: "비밀번호를 입력해주세요." })
            .min(8, "비밀번호는 8자 이상이어야 해요.")
            .max(20, "비밀번호는 20자 이하여야 해요."),
        confirmPassword: z.string({ message: "비밀번호 확인을 입력해주세요." }).min(1, "비밀번호 확인을 입력해주세요."),
        terms: z.boolean().refine((v) => v === true, { message: "이용약관에 동의가 필요해요." }),
        privacy: z.boolean().refine((v) => v === true, { message: "개인정보처리방침 동의가 필요해요." }),
        marketing: z.boolean().optional(),
    })
    .refine((v) => v.password === v.confirmPassword, {
        path: ["confirmPassword"],
        message: "비밀번호가 일치하지 않습니다.",
    });

type RegisterForm = z.infer<typeof RegisterSchema>;

export default function RegisterPage2() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        setError,
        clearErrors,
        watch,
        getValues,
        control,
    } = useForm<RegisterForm>({
        resolver: zodResolver(RegisterSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            nickname: "",
            password: "",
            confirmPassword: "",
            terms: false,
            privacy: false,
            marketing: false,
        },
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [emailChecked, setEmailChecked] = useState(false);
    const [checkedEmailValue, setCheckedEmailValue] = useState("");

    const [nicknameChecked, setNicknameChecked] = useState(false);
    const [checkedNicknameValue, setCheckedNicknameValue] = useState("");

    const handleEmailDuplicateCheck = async () => {
        clearErrors("email");
        setEmailChecked(false);
        const email = getValues("email");
        if (!email || errors.email) return;

        const res = await postData(endpoints.checkEmail, { email });
        if (res?.status === 200) {
            setEmailChecked(true);
            setCheckedEmailValue(email);
            clearErrors("email");
            toastSuccess("이메일 사용이 가능합니다!");
        } else if (res?.status === 409) {
            setError("email", { type: "server", message: "이미 사용 중인 이메일입니다." });
        } else {
            setError("email", { type: "server", message: "이메일 확인 중 오류가 발생했어요. 다시 시도해주세요." });
        }
    };

    const handleNicknameDuplicateCheck = async () => {
        clearErrors("nickname");
        setNicknameChecked(false);
        const nickname = getValues("nickname");
        if (!nickname || errors.nickname) return;

        const res = await postData(endpoints.checkNickname, { nickname });
        if (res?.status === 200) {
            setNicknameChecked(true);
            setCheckedNicknameValue(nickname);
            clearErrors("nickname");
            toastSuccess("닉네임 사용이 가능합니다!");
        } else if (res?.status === 409) {
            setError("nickname", { type: "server", message: "이미 사용 중인 닉네임입니다." });
        } else {
            setError("nickname", { type: "server", message: "닉네임 확인 중 오류가 발생했어요. 다시 시도해주세요." });
        }
    };

    const onSubmit = async (values: RegisterForm) => {
        if (!emailChecked) {
            setError("email", { type: "manual", message: "이메일 중복 확인을 완료해주세요." });
            return;
        }
        if (!nicknameChecked) {
            setError("nickname", { type: "manual", message: "닉네임 중복 확인을 완료해주세요." });
            return;
        }

        const body: SignUpRequestDto = {
            email: values.email,
            nickname: values.nickname,
            password: values.password,
        };

        const res = await postData(endpoints.signUp, body);
        if (!res) {
            setError("root", { message: "서버 응답이 없습니다. 잠시 후 다시 시도해주세요." });
            return;
        }
        const { status } = res;
        if (status === 200 || status === 201) {
            alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
            navigate("/auth/login", { replace: true });
            return;
        }
        if (status === 409) {
            setError("email", { type: "server", message: "이미 가입된 이메일입니다." });
            return;
        }
        setError("root", { message: "회원가입에 실패했습니다. 다시 시도해주세요." });
    };

    useEffect(() => {
        const current = getValues("nickname");
        if (nicknameChecked && current !== checkedNicknameValue) setNicknameChecked(false);
    }, [watch("nickname"), nicknameChecked, checkedNicknameValue, getValues]);

    useEffect(() => {
        const current = getValues("email");
        if (emailChecked && current !== checkedEmailValue) setEmailChecked(false);
    }, [watch("email"), emailChecked, checkedEmailValue, getValues]);

    return (
        <div className="h-[900px] w-full bg-white flex items-center justify-center">
            <div className="w-full max-w-[480px]">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(onSubmit)();
                    }}
                    noValidate
                    className="rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 bg-white"
                >
                    <h1 className="text-xl font-semibold text-slate-900 mb-6">회원가입</h1>

                    <label htmlFor="email" className="block text-[13px] font-medium text-slate-700 mb-1">
                        이메일 *
                    </label>
                    <div className="relative mb-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            className="pl-10 pr-28 h-11 border border-slate-300 bg-slate-50/50 text-[15px] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                            {...register("email")}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleEmailDuplicateCheck}
                            disabled={!!errors.email || !watch("email") || emailChecked}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 border border-slate-300 bg-white text-slate-700"
                        >
                            {emailChecked ? "확인 완료" : "중복 확인"}
                        </Button>
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}

                    <label htmlFor="nickname" className="block mt-4 text-[13px] font-medium text-slate-700 mb-1">
                        닉네임 *
                    </label>
                    <div className="relative mb-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            id="nickname"
                            type="text"
                            placeholder="닉네임을 입력하세요"
                            className="pl-10 pr-28 h-11 border border-slate-300 bg-slate-50/50 text-[15px] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                            {...register("nickname")}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleNicknameDuplicateCheck}
                            disabled={!!errors.nickname || !watch("nickname") || nicknameChecked}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 border border-slate-300 bg-white text-slate-700"
                        >
                            {nicknameChecked ? "확인 완료" : "중복 확인"}
                        </Button>
                    </div>
                    {errors.nickname && <p className="mt-1 text-sm text-red-500">{errors.nickname.message}</p>}

                    <label htmlFor="password" className="block mt-4 text-[13px] font-medium text-slate-700 mb-1">
                        비밀번호 *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="8자 이상, 영문/숫자/특수문자 포함"
                            className="pl-10 pr-12 h-11 border border-slate-300 bg-slate-50/50 text-[15px] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보이기"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4 text-slate-600" /> : <Eye className="h-4 w-4 text-slate-600" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}

                    <label htmlFor="confirmPassword" className="block mt-4 text-[13px] font-medium text-slate-700 mb-1">
                        비밀번호 확인 *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="비밀번호를 다시 입력하세요"
                            className="pl-10 pr-12 h-11 border border-slate-300 bg-slate-50/50 text-[15px] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                            {...register("confirmPassword")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보이기"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200"
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4 text-slate-600" /> : <Eye className="h-4 w-4 text-slate-600" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}

                    <div className="mt-5 space-y-3">
                        <Controller
                            name="terms"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="terms" checked={!!field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                                    <label htmlFor="terms" className="text-sm">
                                        <span className="text-red-500">*</span> 이용약관에 동의합니다{" "}
                                        <button type="button" className="text-blue-600 hover:underline">[보기]</button>
                                    </label>
                                </div>
                            )}
                        />
                        {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms.message}</p>}

                        <Controller
                            name="privacy"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="privacy" checked={!!field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                                    <label htmlFor="privacy" className="text-sm">
                                        <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다{" "}
                                        <button type="button" className="text-blue-600 hover:underline">[보기]</button>
                                    </label>
                                </div>
                            )}
                        />
                        {errors.privacy && <p className="mt-1 text-sm text-red-500">{errors.privacy.message}</p>}

                        <Controller
                            name="marketing"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="marketing" checked={!!field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                                    <label htmlFor="marketing" className="text-sm">
                                        마케팅 정보 수신에 동의합니다 (선택){" "}
                                        <button type="button" className="text-blue-600 hover:underline">[보기]</button>
                                    </label>
                                </div>
                            )}
                        />
                    </div>

                    {errors.root?.message && <p className="text-sm text-red-600 mt-2">{errors.root.message}</p>}

                    <Button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60"
                    >
                        {isSubmitting ? "회원가입 중..." : "회원가입"}
                    </Button>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs text-slate-500">또는</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <p className="text-center text-[13px] text-slate-600">
                        이미 계정이 있으신가요?{" "}
                        <button
                            type="button"
                            className="font-semibold text-blue-600 hover:underline"
                            onClick={() => navigate("/auth/login")}
                        >
                            로그인하기
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
