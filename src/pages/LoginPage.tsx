import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowRight, Sparkles, Bookmark, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { api, LoginRequest } from "@/lib/api";
import { ensureGoogleIdentityLoaded } from "@/lib/googleIdentity";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MoroccoMosaicLogo from "@/components/MoroccoMosaicLogo";
import { Seo } from "@/components/seo/Seo";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { navigateAfterAuth } from "@/lib/authRedirect";
import {
  AuthFormCard,
  AuthGoogleButton,
  AuthMobileHero,
  AuthMobileQuickTrust,
  AuthMobileTopBar,
  AuthOAuthDivider,
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/AuthMobileChrome";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");
  const registerHref =
    redirectTarget != null && redirectTarget !== ""
      ? `/register?redirect=${encodeURIComponent(redirectTarget)}`
      : "/register";
  const { toast } = useToast();
  const { login: setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await api.login(data);
      
      // Update auth state using the hook
      setAuth(response.user, response.token);
      
      toast({
        title: t("auth.success"),
        description: t("auth.loggedInSuccess"),
        variant: "success",
      });

      navigateAfterAuth(navigate, redirectTarget);
    } catch (error) {
      toast({
        title: t("auth.error"),
        description: error instanceof Error ? error.message : t("auth.failedSignIn"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const clientId = await api.getGoogleClientId();

      if (!clientId) {
        toast({
          title: "Configuration Error",
          description:
            "Google sign-in needs a Client ID. Set GOOGLE_CLIENT_ID for the backend or VITE_GOOGLE_CLIENT_ID in frontend .env, then restart the servers.",
          variant: "destructive",
        });
        setIsGoogleLoading(false);
        return;
      }

      await ensureGoogleIdentityLoaded();

      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (response) => {
          try {
            const authResponse = await api.googleAuth(response.access_token);
            setAuth(authResponse.user, authResponse.token);
            
            toast({
              title: "Success",
              description: "Logged in with Google successfully!",
              variant: "success",
            });

            navigateAfterAuth(navigate, redirectTarget);
          } catch (error) {
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to authenticate with Google",
              variant: "destructive",
            });
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in with Google",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] min-h-screen flex">
      <Seo title={t("seo.login.title")} description={t("seo.login.description")} canonicalPath="/login" noIndex />
      {/* Left Side — desert camp hero (local asset) */}
      <div className="hidden lg:flex lg:w-1/2 relative min-h-screen overflow-hidden bg-stone-950">
        <img
          src="/login-hero.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_32%] scale-[1.02] motion-reduce:scale-100"
          decoding="async"
        />
        {/* Readability: warm vignette + bottom weight for text */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/45 to-amber-950/25"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-stone-950/70 via-stone-950/20 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 ring-1 ring-inset ring-white/10"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col justify-between p-8 xl:p-10 text-white h-full min-h-screen">
          <Link
            to="/"
            className="group inline-flex w-fit items-center rounded-lg bg-black/30 px-2.5 py-2 backdrop-blur-md ring-1 ring-white/12 shadow-md transition-all duration-300 hover:bg-black/40 hover:ring-white/20 active:scale-[0.99] [&_img]:h-8 [&_img]:w-8 [&_img]:rounded"
          >
            <MoroccoMosaicLogo
              size="sm"
              variant="compact"
              showTagline={false}
              className="gap-2 transition-transform duration-300 group-hover:scale-[1.02] [&_span]:!text-xs [&_span]:!leading-tight"
            />
          </Link>

          <div className="mt-auto max-w-sm">
            <div className="rounded-xl border border-white/12 bg-black/30 p-4 backdrop-blur-xl shadow-xl">
              <h2 className="font-display text-base font-semibold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="mt-1 text-[11px] leading-snug text-white/65">
                Sign in to pick up your plans.
              </p>

              <div
                className="mt-4 flex overflow-hidden rounded-full border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                role="list"
                aria-label="Member benefits"
              >
                {[
                  { icon: Sparkles, label: "Picks", hint: "Tailored recommendations" },
                  { icon: Bookmark, label: "Saves", hint: "Favorite places" },
                  { icon: CalendarDays, label: "Trips", hint: "Booking status" },
                ].map(({ icon: Icon, label, hint }, i) => (
                  <div
                    key={label}
                    role="listitem"
                    title={hint}
                    className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 px-1 ${i > 0 ? "border-l border-white/10" : ""}`}
                  >
                    <Icon className="h-3.5 w-3.5 text-amber-200/90" strokeWidth={2} aria-hidden />
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/55">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-[100dvh] lg:min-h-screen bg-gradient-to-b from-muted/35 via-background to-muted/20 lg:bg-background">
        <AuthMobileHero
          title={t("auth.login")}
          subtitle={t("auth.loginHeroSubtitle")}
        />
        <AuthMobileQuickTrust />
        <AuthMobileTopBar secondaryLink={{ label: t("auth.signUp"), to: registerHref }} />

        <div className="flex-1 flex flex-col justify-start lg:justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:p-12">
          <div className="w-full max-w-md mx-auto space-y-6 lg:space-y-8 animate-fade-in-up">
            <PageBreadcrumb
              className="hidden lg:flex"
              items={[
                { label: t("nav.home"), to: "/" },
                { label: t("auth.login") },
              ]}
              currentPath="/login"
              includeJsonLd={false}
            />

            <AuthFormCard>
              <div className="lg:hidden space-y-4">
                <AuthGoogleButton
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  loading={isGoogleLoading}
                  loadingLabel={t("auth.googleConnecting")}
                  label={t("auth.signInWithGoogle")}
                />
                <AuthOAuthDivider label={t("auth.dividerOrEmail")} />
              </div>

              {/* Header — logo lives on the left panel on desktop */}
              <div className="space-y-2 mt-2 lg:mt-0">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {t("auth.login")}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground text-pretty">
                  {t("auth.loginSubtitle")}
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4 sm:space-y-5 mt-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {t("auth.email")}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={authInputClassName}
                autoComplete="email"
                inputMode="email"
                {...register("email", {
                  required: t("auth.emailRequired"),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                {t("auth.password")}
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={authInputClassName}
                autoComplete="current-password"
                {...register("password", {
                  required: t("auth.passwordRequired"),
                })}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              className={`${authButtonClassName} group`} 
              size="lg" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                t("common.loading")
              ) : (
                <>
                  {t("auth.signIn")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

              <div className="hidden lg:block space-y-6 mt-6">
                <AuthOAuthDivider label={t("auth.dividerOrContinue")} />
                <AuthGoogleButton
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  loading={isGoogleLoading}
                  loadingLabel={t("auth.googleConnecting")}
                  label={t("auth.signInWithGoogle")}
                />
              </div>

          {/* Footer */}
          <div className="text-center space-y-4 pt-6 max-lg:pb-1">
            <p className="text-sm text-muted-foreground">
              {t("auth.dontHaveAccount")}{" "}
              <Link
                to={registerHref}
                className="text-primary font-medium hover:underline transition-colors inline-flex items-center gap-1"
              >
                {t("auth.signUp")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>
            </AuthFormCard>
        </div>
      </div>
      </div>
    </div>
  );
}
