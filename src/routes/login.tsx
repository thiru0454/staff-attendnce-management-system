import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

/**
 * LoginPage Component
 * 
 * Handles user authentication (login/signup) with:
 * - Email/password validation
 * - Real-time error feedback
 * - Session management
 * - Signup confirmation flow
 * 
 * Features:
 * - Toggle between signin and signup modes
 * - Show/hide password visibility
 * - Field-level error messages
 * - Email confirmation notification
 */
function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (mode === "signup" && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSignupSuccess(true);
        setEmail("");
        setPassword("");
        setErrors({});
        toast.success("Account created! Please check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      toast.error(errorMessage);
      if (errorMessage.includes("Invalid")) {
        setErrors({ email: "Invalid email or password" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setEmail("");
    setPassword("");
    setErrors({});
    setSignupSuccess(false);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "var(--gradient-subtle)" }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl lg:grid-cols-2">
        {/* Brand panel */}
        <div
          className="relative hidden flex-col justify-between p-10 text-primary-foreground lg:flex"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 font-bold backdrop-blur">
                S
              </div>
              <div className="text-lg font-semibold">SAMS</div>
            </div>
            <h1 className="mt-12 text-4xl font-bold leading-tight tracking-tight">
              Staff Attendance,
              <br />
              streamlined.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              A modern dashboard for administrators to manage employees, mark
              attendance, and track reports — all in one place.
            </p>
          </div>
          <div className="space-y-3 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
              Real-time attendance tracking
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
              Department-wise insights
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
              CSV reports & analytics
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 p-8 shadow-none lg:p-12">
          {signupSuccess ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                Check your email
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                We've sent a confirmation email to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Click the link in the email to confirm your account and get started.
              </p>
              <Button
                onClick={() => handleModeChange("signin")}
                variant="outline"
                className="mt-8 w-full"
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">
                  {mode === "signin" ? "Welcome back" : "Create admin account"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === "signin"
                    ? "Sign in to access your dashboard"
                    : "Set up your administrator credentials"}
                </p>
              </div>

              <form onSubmit={handle} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors({ ...errors, email: undefined });
                        }
                      }}
                      placeholder="admin@company.com"
                      className={errors.email ? "border-red-500" : ""}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      minLength={6}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors({ ...errors, password: undefined });
                        }
                      }}
                      placeholder="••••••••"
                      className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      {errors.password}
                    </p>
                  )}
                  {mode === "signup" && password && password.length < 6 && (
                    <p className="text-xs text-amber-600">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  size="lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>

              {/* Toggle Mode */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("signup")}
                      disabled={loading}
                      className="font-medium text-primary hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("signin")}
                      disabled={loading}
                      className="font-medium text-primary hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
