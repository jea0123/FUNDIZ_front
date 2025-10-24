import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toastError, toastSuccess, toPublicUrl } from "@/utils/utils";
import type { LoginUser } from "@/types";
import { useCookies } from "react-cookie";
import { deleteData, endpoints, postData } from "@/api/apis";
import { useLoginUserStore } from "@/store/LoginUserStore.store";
import defaultProfileImg from "@/assets/images/default-profile.webp";

const profileSchema = z.object({
    email: z.string().email(),
    nickname: z
        .string()
        .min(2, "닉네임은 2자 이상")
        .max(10, "닉네임은 10자 이하"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "현재 비밀번호를 입력하세요"),
        newPassword: z
            .string()
            .min(8, "최소 8자"),
        confirmPassword: z.string().min(1, "비밀번호 확인을 입력하세요"),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
        path: ["confirmPassword"],
        message: "새 비밀번호가 일치하지 않습니다",
    });

type PasswordForm = z.infer<typeof passwordSchema>;

const initials = (name?: string) =>
    (name ?? "?")
        .trim()
        .slice(0, 2)
        .toUpperCase();

const fileToDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = reject;
        fr.readAsDataURL(f);
    });

const MAX_IMG_MB = 3;

const AccountSettingTab: React.FC = () => {
    const [cookie, setCookie] = useCookies();

    const { loginUser, setLoginUser, resetLoginUser } = useLoginUserStore();

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const hasAvatarChange = !!avatarFile;

    const [openDelete, setOpenDelete] = useState(false);

    const { register, setValue, handleSubmit, reset, formState: { isDirty, isSubmitting, errors }, watch, } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            email: loginUser?.email ?? "",
            nickname: loginUser?.nickname ?? "",
        },
    });

    const pwdForm = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { setError, clearErrors } = pwdForm;

    useEffect(() => {
        if (loginUser?.profileImg) {
            setAvatarPreview(toPublicUrl(loginUser.profileImg) ?? null);
        }
    }, [loginUser?.profileImg]);

    const onPickAvatar: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            toastError("이미지 파일만 업로드할 수 있어요.");
            return;
        }
        if (f.size > MAX_IMG_MB * 1024 * 1024) {
            toastError(`이미지 용량은 최대 ${MAX_IMG_MB}MB까지 허용해요.`);
            return;
        }
        setAvatarFile(f);
        setAvatarPreview(await fileToDataUrl(f));
    };

    const onResetAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const onSubmitProfile = async (values: ProfileForm) => {
        try {
            const res = await postData(endpoints.updateNickname, { nickname: values.nickname }, cookie.accessToken);
            if (res.status === 200) {
                setLoginUser({ ...(loginUser as LoginUser), nickname: res.data });
                setValue("nickname", res.data, { shouldDirty: false, shouldValidate: true });
                toastSuccess("닉네임이 수정되었어요.");
            } else if (res.status === 409) {
                toastError("이미 사용 중인 닉네임이에요.");
            } else {
                toastError("닉네임 수정에 실패했어요.");
            }

            if (avatarFile) {
                const fd = new FormData();
                fd.append("profileImg", avatarFile);
                const up = await postData(endpoints.updateProfileImg, fd, cookie.accessToken);
                if (up.status === 200) {
                    setLoginUser({ ...(loginUser as LoginUser), profileImg: up.data });
                    setAvatarPreview(toPublicUrl(up.data));
                    toastSuccess("프로필 사진이 수정되었어요.");
                } else {
                    toastError("프로필 이미지 수정에 실패했어요.");
                }
            }
            setAvatarFile(null);
        } catch (e: any) {
            toastError(e?.message ?? "프로필 수정에 실패했어요.");
        }
    };

    const onChangePassword = pwdForm.handleSubmit(async (v) => {
        try {
            clearErrors();
            const res = await postData(endpoints.changePassword, { password: v.currentPassword, newPassword: v.newPassword, }, cookie.accessToken);
            if (res.status === 200) {
                toastSuccess("비밀번호가 변경되었어요.");
                pwdForm.reset();
            } else {
                const msg = res.message ?? "비밀번호 변경에 실패했어요.";

                if (/현재|current/i.test(msg)) {
                    setError("currentPassword", { type: "server", message: msg });
                }
                else if (/동일|new/i.test(msg)) {
                    setError("newPassword", { type: "server", message: msg });
                }
                else {
                    setError("root", { type: "server", message: msg });
                }
            }
        } catch (e: any) {
            toastError(e?.message ?? "비밀번호 변경에 실패했어요.");
            setError("root", { type: "server", message: e?.message ?? "비밀번호 변경에 실패했어요." });
        }
    });

    const onDeleteAccount = async () => {
        try {
            const res = await deleteData(endpoints.withdraw, cookie.accessToken);
            if (res.status === 200) {
                resetLoginUser();
                toastSuccess("회원탈퇴가 완료되었어요.");
                setCookie("accessToken", "", { path: "/" });
                setOpenDelete(false);
                window.location.href = "/";
            } else {
                toastError("회원탈퇴에 실패했어요.");
            }
        } catch (e: any) {
            toastError(e?.message ?? "회원탈퇴에 실패했어요.");
        }
    };

    const nick = watch("nickname");
    const avatarFallback = useMemo(() => initials(nick || loginUser?.nickname), [nick, loginUser?.nickname]);

    if (!loginUser) {
        return (
            <div className="p-6 text-sm text-destructive">사용자 정보를 가져올 수 없습니다.</div>
        );
    }

    return (
        <div className="w-full max-w-3xl px-4 py-6">
            <h2 className="text-2xl font-semibold mb-3 flex items-center">내 정보 수정</h2>
            <p className="text-sm text-muted-foreground mb-6">이메일은 로그인 ID로 사용되며 수정할 수 없습니다. 닉네임과 프로필 이미지를 변경할 수 있어요.</p>

            {/* 프로필 섹션 */}
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center gap-3">
                        <Avatar className="h-24 w-24 ring-1 ring-border">
                            <AvatarImage src={(avatarPreview ?? toPublicUrl(loginUser.profileImg)) ?? defaultProfileImg} alt="avatar" />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div className="flex gap-2">
                            <Label
                                htmlFor="avatar"
                                className="cursor-pointer px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm"
                            >
                                이미지 변경
                            </Label>
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onPickAvatar}
                            />
                            {hasAvatarChange && (
                                <Button type="button" variant="ghost" size="sm" onClick={onResetAvatar}>
                                    취소
                                </Button>
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            JPG/PNG • 최대 {MAX_IMG_MB}MB
                        </p>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">이메일</Label>
                                <Input id="email" {...register("email")} readOnly className="bg-muted" />
                            </div>
                            <div>
                                <Label htmlFor="nickname">닉네임</Label>
                                <Input id="nickname" placeholder="2~10자" {...register("nickname")} />
                                {errors.nickname && (
                                    <p className="text-xs text-destructive mt-1">{errors.nickname.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            reset({
                                email: loginUser?.email,
                                nickname: loginUser?.nickname,
                            });
                            onResetAvatar();
                        }}
                        disabled={isSubmitting}
                    >
                        변경 취소
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "저장 중..." : "저장"}
                    </Button>
                </div>
            </form>

            <Separator className="my-8" />

            {/* 비밀번호 변경 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold">비밀번호 변경</h3>
                <form onSubmit={onChangePassword} className="space-y-3 max-w-lg">
                    <div>
                        <Label htmlFor="curr">현재 비밀번호</Label>
                        <Input
                            id="curr"
                            type="password"
                            autoComplete="current-password"
                            {...pwdForm.register("currentPassword")}
                        />
                        {pwdForm.formState.errors.currentPassword && (
                            <p className="text-xs text-destructive mt-1">
                                {pwdForm.formState.errors.currentPassword.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="new">새 비밀번호</Label>
                        <Input
                            id="new"
                            type="password"
                            autoComplete="new-password"
                            placeholder="8자 이상, 대/소문자, 숫자 포함"
                            {...pwdForm.register("newPassword")}
                        />
                        {pwdForm.formState.errors.newPassword && (
                            <p className="text-xs text-destructive mt-1">
                                {pwdForm.formState.errors.newPassword.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="confirm">새 비밀번호 확인</Label>
                        <Input id="confirm" type="password" {...pwdForm.register("confirmPassword")} />
                        {pwdForm.formState.errors.confirmPassword && (
                            <p className="text-xs text-destructive mt-1">
                                {pwdForm.formState.errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                    {"root" in pwdForm.formState.errors && pwdForm.formState.errors.root?.message && (
                        <p className="text-sm text-destructive">{pwdForm.formState.errors.root?.message}</p>
                    )}
                    <div className="pt-2">
                        <Button type="submit" disabled={pwdForm.formState.isSubmitting}>
                            {pwdForm.formState.isSubmitting ? "변경 중..." : "비밀번호 변경"}
                        </Button>
                    </div>
                </form>
            </section>

            <Separator className="my-8" />

            {/* 위험 구역 */}
            <section className="space-y-3">
                <h3 className="text-lg font-semibold text-destructive">계정 위험 작업</h3>
                <p className="text-sm text-muted-foreground">
                    회원탈퇴 시 계정과 연동된 데이터가 삭제되거나 복구가 어려울 수 있습니다.
                </p>
                <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">회원탈퇴</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>정말 탈퇴하시겠어요?</DialogTitle>
                            <DialogDescription>
                                이 작업은 되돌릴 수 없습니다. 진행하시려면 “탈퇴”를 눌러주세요.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenDelete(false)}>
                                취소
                            </Button>
                            <Button variant="destructive" onClick={onDeleteAccount}>
                                탈퇴
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </section>
        </div>
    );
};

export default AccountSettingTab;
