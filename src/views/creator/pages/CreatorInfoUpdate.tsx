import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { endpoints, getData, postData } from "@/api/apis";
import { toastError, toastSuccess, toPublicUrl } from "@/utils/utils";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useCreatorId } from "../../../types/useCreatorId";

export type CreatorType = "GENERAL" | "INDIVIDUAL" | "CORPORATION";

const hintCls = "h-5 mt-1 text-xs leading-4";

const schema = z.object({
    creatorName: z.string()
        .min(2, "닉네임은 2자 이상")
        .max(10, "닉네임은 최대 10자"),
    creatorType: z.enum(["GENERAL", "INDIVIDUAL", "CORPORATION"] as const),
    email: z.string().email("유효한 이메일 형식이 아닙니다"),
    phone: z.string()
        .min(9, "전화번호를 입력하세요")
        .regex(/^[0-9\-]+$/, "숫자와 '-'만 입력")
        .regex(/^(01[016789]|02|0[3-9][0-9]?)-?[0-9]{3,4}-?[0-9]{4}$/, "유효한 전화번호 형식이 아닙니다"),
    bank: z.string().min(2, "은행을 선택하세요"),
    account: z.string().min(5, "계좌번호를 입력하세요")
        .regex(/^[0-9]+$/, "계좌번호는 숫자만 입력"),
    businessNum: z.string()
        .regex(/^[0-9\-]*$/, "사업자번호는 숫자와 '-'만 입력")
        .optional()
        .transform((v) => (v ?? "").trim()),
    profileImg: z.any().optional(),
})
    .refine(
        (values) => {
            // 사업자 유형이면 사업자번호 필수
            if ((values.creatorType === "INDIVIDUAL" || values.creatorType === "CORPORATION") && !values.businessNum) {
                return false;
            }
            return true;
        },
        {
            path: ["businessNum"],
            message: "사업자/법인 유형은 사업자번호가 필수입니다",
        }
    );

export type UpdateCreatorForm = z.input<typeof schema>;

export default function CreatorInfoUpdate() {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [cookie] = useCookies();
    const navigate = useNavigate();
    const {creatorId, loading: idLoading} = useCreatorId(1);

    const form = useForm<UpdateCreatorForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            creatorName: "",
            creatorType: "GENERAL",
            email: "",
            phone: "",
            bank: "",
            account: "",
            businessNum: "",
            profileImg: ""
        },
        mode: "onBlur",
    });

    const type = form.watch("creatorType");

    // API에서 기존 데이터 가져오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getData(endpoints.getCreatorInfo, cookie.accessToken); // 기존 데이터를 가져오는 API
                if (res.status === 200) {
                    const data = res.data;
                    form.reset(data);
                    const profileImgUrl = toPublicUrl(data.profileImg); // 기존 데이터를 폼에 채움
                    if (profileImgUrl) {
                        setPreview(profileImgUrl); // 기존 프로필 이미지 미리보기
                    }
                } else {
                    toastError("데이터를 불러오는 데 실패했습니다");
                }
            } catch (err) {
                console.error(err);
                toastError("데이터를 불러오는 데 실패했습니다");
            }
        };

        fetchData();
    }, [cookie.accessToken, form]);

    const onFileChange = (file?: File) => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
    };

    const onSubmit = async (values: UpdateCreatorForm) => {
        try {
            const fd = new FormData();
            fd.append("creatorName", values.creatorName);
            fd.append("creatorType", values.creatorType);
            fd.append("email", values.email);
            fd.append("phone", values.phone);
            fd.append("bank", values.bank);
            fd.append("account", values.account);
            if (values.businessNum) fd.append("businessNum", values.businessNum);
            // profileImgUrl이 있으면 해당 URL을 전송
            if (!fileRef.current?.files?.[0] && preview) {
            // 파일을 선택하지 않았고 preview URL이 있다면 URL만 전송
                fd.append("profileImgUrl", preview); 
            } else if (fileRef.current?.files?.[0]) {
            // 파일을 선택한 경우 해당 파일을 전송
                fd.append("profileImg", fileRef.current.files[0]); 
            }

            const res = await postData(endpoints.updateCreatorInfo(Number(creatorId)), fd, cookie.accessToken);
            if (res.status === 200) {
                toastSuccess("정보가 수정되었습니다");
            } else {
                toastError("등록에 실패했습니다");
            }
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.statusText || err?.message || "등록에 실패했습니다";
            toastError(msg);
        }
    };

    const resetAll = () => {
        form.reset();
        form.setValue("bank", "");
        form.setValue("profileImg", "");
        if (fileRef.current) fileRef.current.value = "";
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
    };

    return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>크리에이터 등록</CardTitle>
                    <CardDescription>
                        최초 1회만 등록합니다. 유형에 따라 필요한 정보를 정확히 입력해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {/* 프로필 이미지 */}
                                <FormField
                                    control={form.control}
                                    name="profileImg"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>프로필 이미지</FormLabel>
                                            <FormControl>
                                                <Input
                                                    ref={fileRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        onFileChange(file);
                                                        field.onChange(e.target.files);
                                                    }}
                                                />
                                            </FormControl>
                                            <div className={hintCls}>
                                                {form.formState.errors.profileImg ? <FormMessage /> :
                                                    <FormDescription className="text-muted-foreground">정사각형 이미지 권장 (최대 5MB)</FormDescription>}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* 닉네임 */}
                                <FormField
                                    control={form.control}
                                    name="creatorName"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2 ml-30">
                                            <FormLabel>판매자 닉네임</FormLabel>
                                            <FormControl>
                                                <Input placeholder="최대 10자" {...field} />
                                            </FormControl>
                                            <div className={hintCls}>
                                                {form.formState.errors.creatorName
                                                    ? <FormMessage />
                                                    : <FormDescription className="text-muted-foreground">다른 창작자와 중복 가능</FormDescription>}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                {preview && (
                                    <img
                                        src={preview}
                                        alt="미리보기"
                                        className="mt-3 h-28 w-28 rounded-full object-cover border"
                                    />
                                )}
                            </div>

                            {/* 유형 & 사업자번호 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="creatorType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>창작자 유형</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="GENERAL">GENERAL · 일반</SelectItem>
                                                    <SelectItem value="INDIVIDUAL">INDIVIDUAL · 개인사업자</SelectItem>
                                                    <SelectItem value="CORPORATION">CORPORATION · 법인사업자</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className={hintCls}>
                                                {form.formState.errors.creatorType
                                                    ? <FormMessage />
                                                    : <FormDescription className="text-muted-foreground">
                                                        일반은 취미/개인 창작자, 사업자 유형은 사업자번호가 필요합니다.
                                                    </FormDescription>}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="businessNum"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2 ml-30">
                                            <FormLabel>사업자번호</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={type === "GENERAL" ? "일반 유형은 비워두세요" : "예) 123-45-67890"}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <div className={hintCls}>
                                                {form.formState.errors.businessNum
                                                    ? <FormMessage />
                                                    : <FormDescription className="text-muted-foreground">
                                                        {type === "GENERAL"
                                                            ? "일반 유형은 비워두세요"
                                                            : "하이픈(-) 포함, 사업자/법인 유형은 필수"}
                                                    </FormDescription>}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* 연락/정산 정보 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>이메일</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="you@example.com" {...field} />
                                            </FormControl>
                                            <div className={hintCls}>
                                                {form.formState.errors.email
                                                    ? <FormMessage />
                                                    : <FormDescription className="text-muted-foreground"></FormDescription>}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2 ml-30">
                                            <FormLabel>전화번호</FormLabel>
                                            <FormControl>
                                                <Input placeholder="010-1234-5678" {...field} />
                                            </FormControl>
                                            <div className={hintCls}>
                                                {form.formState.errors.phone
                                                    ? <FormMessage />
                                                    : <FormDescription className="text-muted-foreground">숫자와 '-'만 입력</FormDescription>}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="bank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>은행</FormLabel>
                                            <Select value={field.value || undefined} onValueChange={(v) => field.onChange(v)}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                        <SelectItem value="KB">국민(KB)</SelectItem>
                                                        <SelectItem value="SHINHAN">신한</SelectItem>
                                                        <SelectItem value="WOORI">우리</SelectItem>
                                                        <SelectItem value="HANA">하나</SelectItem>
                                                        <SelectItem value="NH">농협(NH)</SelectItem>
                                                        <SelectItem value="KAKAO">카카오뱅크</SelectItem>
                                                        <SelectItem value="TOSS">토스뱅크</SelectItem>
                                                        <SelectItem value="IBK">기업</SelectItem>
                                                        <SelectItem value="SC">SC제일</SelectItem>
                                                        <SelectItem value="OTHERS">기타</SelectItem>
                                                    </SelectContent>
                                            </Select>
                                            <div className={hintCls}>
                                                {form.formState.errors.bank
                                                    ? <FormMessage />
                                                    : <FormDescription className="text-muted-foreground"></FormDescription>}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="account"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2 ml-30">
                                            <FormLabel>계좌번호 (정산용)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="하이픈 없이 입력" {...field} />
                                            </FormControl>
                                            <div className={hintCls}>
                                                {form.formState.errors.account
                                                    ? <FormMessage />
                                                    : <FormDescription className="text-muted-foreground"></FormDescription>}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={resetAll} >
                                    초기화
                                </Button>
                                <Button type="submit" className="">수정하기</Button>
                            </div>
                        </form>
                    </Form>

                    {/* 하단 가이드 */}
                    <div className="mt-6 rounded-xl border bg-muted/30 p-4 text-sm">
                        <p className="font-medium">유형 안내</p>
                        <ul className="mt-2 list-disc pl-5 space-y-1">
                            <li><span className="font-semibold">GENERAL</span> : 일반 · 취미 기반 개인</li>
                            <li><span className="font-semibold">INDIVIDUAL</span> : 개인사업자 (사업자번호 필수)</li>
                            <li><span className="font-semibold">CORPORATION</span> : 법인사업자 (사업자번호 필수)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
    );
}
