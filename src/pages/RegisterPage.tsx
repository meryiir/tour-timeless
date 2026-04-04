import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { api, RegisterRequest } from "@/lib/api";
import { ensureGoogleIdentityLoaded } from "@/lib/googleIdentity";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MoroccoMosaicLogo from "@/components/MoroccoMosaicLogo";
import { useTranslation } from "react-i18next";
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

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");
  const loginHref =
    redirectTarget != null && redirectTarget !== ""
      ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
      : "/login";
  const { toast } = useToast();
  const { login: setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest & { confirmPassword: string }>();

  const password = watch("password");

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Extract only the fields needed for registration, excluding confirmPassword
      const { confirmPassword, ...registerData } = data;
      
      // Ensure all required fields are present
      if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.password) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Remove phone if it's empty
      if (!registerData.phone || registerData.phone.trim() === '') {
        delete registerData.phone;
      }
      const response = await api.register(registerData);
      
      // Update auth state using the hook
      setAuth(response.user, response.token);
      
      toast({
        title: "Success",
        description: "Account created successfully!",
        variant: "success",
      });

      navigateAfterAuth(navigate, redirectTarget);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
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
              description: "Account created with Google successfully!",
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
        description: error instanceof Error ? error.message : "Failed to sign up with Google",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] min-h-screen flex">
      <Seo title={t("seo.register.title")} description={t("seo.register.description")} canonicalPath="/register" noIndex />
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/40 to-accent/50" />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground h-full">
          <Link 
            to="/" 
            className="inline-flex items-center mb-8 group transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
          >
            <div className="[&_svg]:drop-shadow-lg [&_div]:drop-shadow-md">
              <MoroccoMosaicLogo size="lg" variant="full" showTagline={true} className="transition-transform duration-300 group-hover:scale-105" />
            </div>
          </Link>
          
          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-bold">Start Your Journey</h2>
            </div>
            <p className="text-lg text-primary-foreground/90 leading-relaxed">
              Join thousands of travelers discovering amazing destinations and unforgettable experiences around the world.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-white/80" />
                <span>Exclusive Deals</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-white/80" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-white/80" />
                <span>Secure Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-[100dvh] lg:min-h-screen bg-gradient-to-b from-muted/35 via-background to-muted/20 lg:bg-background">
        <AuthMobileHero
          title={t("auth.register")}
          subtitle={t("auth.registerHeroSubtitle")}
        />
        <AuthMobileQuickTrust />
        <AuthMobileTopBar secondaryLink={{ label: t("auth.signIn"), to: loginHref }} />

        <div className="flex-1 flex flex-col justify-start lg:justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:p-12">
          <div className="w-full max-w-md mx-auto space-y-6 lg:space-y-8 animate-fade-in-up">
            <PageBreadcrumb
              className="hidden lg:flex"
              items={[
                { label: t("nav.home"), to: "/" },
                { label: t("auth.register") },
              ]}
              currentPath="/register"
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

              {/* Header — logo on left panel (desktop) */}
              <div className="space-y-2 mt-2 lg:mt-0">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {t("auth.createAccount")}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground text-pretty">{t("auth.registerSubtitle")}</p>
              </div>

              {/* Form */}
              <form className="space-y-4 sm:space-y-5 mt-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  First Name
                </label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className={authInputClassName}
                  autoComplete="given-name"
                  {...register("firstName", {
                    required: "First name is required",
                    maxLength: { value: 100, message: "First name must not exceed 100 characters" },
                  })}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Last Name
                </label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className={authInputClassName}
                  autoComplete="family-name"
                  {...register("lastName", {
                    required: "Last name is required",
                    maxLength: { value: 100, message: "Last name must not exceed 100 characters" },
                  })}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={authInputClassName}
                autoComplete="email"
                inputMode="email"
                {...register("email", {
                  required: "Email is required",
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

            {/* Password Fields */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={authInputClassName}
                autoComplete="new-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                  maxLength: { value: 100, message: "Password must not exceed 100 characters" },
                })}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={authInputClassName}
                autoComplete="new-password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  {errors.confirmPassword.message}
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
                "Creating Account..."
              ) : (
                <>
                  Create Account
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
              {t("auth.alreadyHaveAccount")}{" "}
              <Link
                to={loginHref}
                className="text-primary font-medium hover:underline transition-colors inline-flex items-center gap-1"
              >
                {t("auth.signIn")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[28rem] mx-auto">
              {t("auth.termsNotice")}{" "}
              <Link to="/terms" className="text-primary hover:underline">
                {t("breadcrumb.terms")}
              </Link>{" "}
              {t("auth.and")}{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                {t("breadcrumb.privacy")}
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
