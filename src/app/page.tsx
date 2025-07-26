
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/contexts/language-context';
import { SplashScreen } from '@/components/splash-screen';

const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function LoginPage() {
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useTranslation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: AuthFormValues) => {
    try {
      if (isSignUp) {
        await signUpWithEmail(data.email, data.password);
        toast({ title: t('toast.signUpSuccess'), description: t('toast.signUpSuccessDesc') });
        setIsSignUp(false); // Switch to login view after successful signup
      } else {
        await signInWithEmail(data.email, data.password);
      }
    } catch (error: any) {
      console.error(`${isSignUp ? 'Sign-up' : 'Sign-in'} failed`, error);
      
      let description = t('toast.unexpectedError');
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          description = t('toast.invalidCredentials');
      } else if (error.code === 'auth/email-already-in-use') {
          description = t('toast.emailInUse');
      } else {
          description = error.message;
      }

      toast({
        title: isSignUp ? t('toast.signUpFailed') : t('toast.signInFailed'),
        description: description,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <SplashScreen />;
  }
  
  // If user is logged in, useEffect will redirect. In the meantime,
  // we can show a splash screen or null to avoid flashing the login page.
  if (user) {
    return <SplashScreen />;
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
       <div className="hidden bg-muted lg:block relative">
        <Image
          src="https://placehold.co/1200x900.png"
          alt={t('login.imageAlt')}
          data-ai-hint="lush indian farm sunset"
          width="1200"
          height="900"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-4xl font-bold font-headline">{t('login.tagline')}</h2>
            <p className="text-lg mt-2 max-w-lg">{t('login.subTagline')}</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 bg-background">
        <div className="mx-auto grid w-[380px] gap-8">
          <div className="grid gap-2 text-center">
            <Link href="/" className="flex items-center justify-center gap-2 font-semibold font-headline text-2xl text-primary">
                <Icons.logo className="h-7 w-7" />
                <span>KrishiMitra</span>
            </Link>
            <p className="text-balance text-muted-foreground">
              {isSignUp ? t('login.createAccountPrompt') : t('login.signInPrompt')}
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('login.emailLabel')}</Label>
              <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('login.passwordLabel')}</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full mt-2 py-3 text-base">
              {isSubmitting ? t('login.processing') : (isSignUp ? t('login.createAccountButton') : t('login.signInButton'))}
            </Button>
          </form>

          <div className="mt-2 text-center text-sm">
            {isSignUp ? t('login.alreadyHaveAccount') : t('login.dontHaveAccount')}
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="pl-1 text-primary">
              {isSignUp ? t('login.signInLink') : t('login.signUpLink')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
