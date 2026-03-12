import { Link, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { api, RegisterRequest } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login: setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
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
      
      // Debug: log the data to see what we're sending
      console.log('Form data:', data);
      console.log('Register data:', registerData);
      
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card shadow-elevated animate-fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold text-foreground mb-2">
            <MapPin className="h-6 w-6 text-primary" />Wanderlust
          </Link>
          <h1 className="font-display text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join thousands of happy travelers</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium mb-1.5 block">First Name</label>
              <Input
                id="firstName"
                placeholder="John"
                {...register("firstName", {
                  required: "First name is required",
                  maxLength: { value: 100, message: "First name must not exceed 100 characters" },
                })}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium mb-1.5 block">Last Name</label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register("lastName", {
                  required: "Last name is required",
                  maxLength: { value: 100, message: "Last name must not exceed 100 characters" },
                })}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium mb-1.5 block">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
                maxLength: { value: 100, message: "Password must not exceed 100 characters" },
              })}
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium mb-1.5 block">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
