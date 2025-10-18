import { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { endpoints, postData } from '@/api/apis';
import type SignUpRequestDto from '@/api/request/auth/SignUpRequestDto.dto';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const RegisterSchema = z
  .object({
    email: z
      .string({ message: '이메일을 입력해주세요.' })
      .min(1, '이메일을 입력해주세요.')
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: '유효한 이메일 형식이 아닙니다.' }),
    nickname: z.string({ message: '닉네임을 입력해주세요.' }).min(2, '닉네임은 2자 이상이어야 해요.').max(10, '닉네임은 10자 이하여야 해요.'),
    password: z.string({ message: '비밀번호를 입력해주세요.' }).min(1, '비밀번호를 입력해주세요.').min(8, '비밀번호는 8자 이상이어야 해요.'),
    confirmPassword: z.string({ message: '비밀번호 확인을 입력해주세요.' }).min(1, '비밀번호 확인을 입력해주세요.'),
    terms: z.boolean().refine((v) => v === true, { message: '이용약관에 동의가 필요해요.' }),
    privacy: z.boolean().refine((v) => v === true, { message: '개인정보처리방침 동의가 필요해요.' }),
    marketing: z.boolean(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: '비밀번호가 일치하지 않습니다.',
  });

type RegisterForm = z.infer<typeof RegisterSchema>;

export function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setError,
    clearErrors,
    watch,
    getValues,
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      terms: false,
      privacy: false,
      marketing: false,
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailChecked, setEmailChecked] = useState(false);
  const [checkedEmailValue, setCheckedEmailValue] = useState('');

  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [checkedNicknameValue, setCheckedNicknameValue] = useState('');

  const handleEmailDuplicateCheck = async () => {
    clearErrors('email');
    setEmailChecked(false);

    const email = getValues('email');
    if (!email || errors.email) return;

    const res = await postData(endpoints.checkEmail, { email });
    if (res?.status === 200) {
      setEmailChecked(true);
      setCheckedEmailValue(email);
      clearErrors('email');
    } else if (res?.status === 409) {
      setError('email', { type: 'server', message: '이미 사용 중인 이메일입니다.' });
    } else {
      setError('email', { type: 'server', message: '이메일 확인 중 오류가 발생했어요. 다시 시도해주세요.' });
    }
  };

  const handleNicknameDuplicateCheck = async () => {
    clearErrors('nickname');
    setNicknameChecked(false);

    const nickname = getValues('nickname');
    if (!nickname || errors.nickname) return;

    const res = await postData(endpoints.checkNickname, { nickname });
    if (res?.status === 200) {
      setNicknameChecked(true);
      setCheckedNicknameValue(getValues('nickname'));
      clearErrors('nickname');
    } else if (res?.status === 409) {
      setError('nickname', { type: 'server', message: '이미 사용 중인 닉네임입니다.' });
    } else {
      setError('nickname', { type: 'server', message: '닉네임 확인 중 오류가 발생했어요. 다시 시도해주세요.' });
    }
  };

  const onSubmit = async (values: RegisterForm) => {
    if (!emailChecked) {
      setError('email', { type: 'manual', message: '이메일 중복 확인을 완료해주세요.' });
      return;
    }
    if (!nicknameChecked) {
      setError('nickname', { type: 'manual', message: '닉네임 중복 확인을 완료해주세요.' });
      return;
    }

    const requestBody: SignUpRequestDto = {
      email: values.email,
      nickname: values.nickname,
      password: values.password,
    };

    const response = await postData(endpoints.signUp, requestBody);

    if (!response) {
      setError('root', { message: '서버 응답이 없습니다. 잠시 후 다시 시도해주세요.' });
      return;
    }

    const { status } = response;
    if (status === 200 || status === 201) {
      navigate('/auth/login', { replace: true });
      return;
    } else if (status === 409) {
      setError('email', { type: 'server', message: '이미 가입된 이메일입니다.' });
      return;
    } else {
      setError('root', { message: '회원가입에 실패했습니다. 다시 시도해주세요.' });
      return;
    }
  };

  useEffect(() => {
    const current = getValues('nickname');
    if (nicknameChecked && current !== checkedNicknameValue) {
      setNicknameChecked(false);
    }
  }, [watch('nickname'), nicknameChecked, checkedNicknameValue]);

  useEffect(() => {
    const current = getValues('email');
    if (emailChecked && current !== checkedEmailValue) {
      setEmailChecked(false);
    }
  }, [watch('email'), emailChecked, checkedEmailValue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8" style={{ marginBottom: '200px' }}>
        <div className="text-center">
          <h2 className="text-3xl mb-2">회원가입</h2>
          <p className="text-gray-600">크라우드펀딩 플랫폼에 오신 것을 환영합니다</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>계정 만들기</CardTitle>
            <CardDescription>
              이미 계정이 있으신가요?{' '}
              <button onClick={() => navigate('/auth/login')} className="text-blue-600 hover:underline cursor-pointer">
                로그인하기
              </button>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}
              <div>
                <Label htmlFor="email">이메일 *</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="email" type="email" placeholder="example@email.com" className="pl-10 w-9/12" {...register('email')} />
                  <Button type="button" className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-md px-2 py-1 cursor-pointer text-gray-700" variant="ghost" onClick={handleEmailDuplicateCheck} disabled={!!errors.email || !watch('email') || emailChecked}>
                    {emailChecked ? '확인 완료' : '중복 확인'}
                  </Button>
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Nickname */}
              <div>
                <Label htmlFor="nickname">닉네임 *</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="nickname" type="text" placeholder="닉네임을 입력하세요" className="pl-10 w-9/12" {...register('nickname')} />
                  <Button type="button" className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-md px-2 py-1 cursor-pointer text-gray-700" variant="ghost" onClick={handleNicknameDuplicateCheck} disabled={!!errors.nickname || !watch('nickname') || nicknameChecked}>
                    {nicknameChecked ? '확인 완료' : '중복 확인'}
                  </Button>
                </div>
                {errors.nickname && <p className="mt-1 text-sm text-red-500">{errors.nickname.message}</p>}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">비밀번호 *</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="8자 이상, 영문/숫자/특수문자 포함" className="pl-10 pr-10" {...register('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="비밀번호를 다시 입력하세요" className="pl-10 pr-10" {...register('confirmPassword')} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              {/* Agreements */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" {...register('terms')} />
                  <label htmlFor="terms" className="text-sm">
                    <span className="text-red-500">*</span> 이용약관에 동의합니다{' '}
                    <button type="button" className="text-blue-600 hover:underline cursor-pointer">
                      [보기]
                    </button>
                  </label>
                </div>
                {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms.message}</p>}

                <div className="flex items-center space-x-2">
                  <Checkbox id="privacy" {...register('privacy')} />
                  <label htmlFor="privacy" className="text-sm">
                    <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다{' '}
                    <button type="button" className="text-blue-600 hover:underline cursor-pointer">
                      [보기]
                    </button>
                  </label>
                </div>
                {errors.privacy && <p className="mt-1 text-sm text-red-500">{errors.privacy.message}</p>}

                <div className="flex items-center space-x-2">
                  <Checkbox id="marketing" {...register('marketing')} />
                  <label htmlFor="marketing" className="text-sm">
                    마케팅 정보 수신에 동의합니다 (선택){' '}
                    <button type="button" className="text-blue-600 hover:underline cursor-pointer">
                      [보기]
                    </button>
                  </label>
                </div>
              </div>

              {/* Root(server) error */}
              {errors.root?.message && <p className="text-sm text-red-600 mt-2">{errors.root.message}</p>}

              <Button type="submit" className="w-full cursor-pointer" disabled={!isValid || isSubmitting}>
                {isSubmitting ? '회원가입 중...' : '회원가입'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
