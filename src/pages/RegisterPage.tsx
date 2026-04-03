import { Link, useNavigate } from "react-router-dom";
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

export default function RegisterPage() {
  const navigate = useNavigate();
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
      });
      
      // Redirect to home page
      navigate("/");
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
            });
            
            navigate("/");
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
    <div className="min-h-screen flex">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center group transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
            >
              <MoroccoMosaicLogo size="md" variant="full" className="transition-transform duration-300 group-hover:scale-105" />
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground">Create Your Account</h1>
            <p className="text-muted-foreground">
              Join our community of travelers and start exploring the world
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                  className="h-11"
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
                  className="h-11"
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
                className="h-11"
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
                className="h-11"
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
                className="h-11"
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
              className="w-full h-11 text-base font-medium group" 
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social Login Options */}
          <Button 
            variant="outline" 
            className="w-full h-11 border-2 hover:bg-muted hover:border-primary/30 hover:shadow-sm hover:text-foreground transition-all duration-200" 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              "Connecting..."
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Footer */}
          <div className="text-center space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-primary font-medium hover:underline transition-colors inline-flex items-center gap-1"
              >
                Sign in
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
