import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Github
} from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";

type AuthMode = "login" | "register";

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = (searchParams.get("mode") as AuthMode) || "login";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const toggleMode = () => {
    setSearchParams({ mode: mode === "login" ? "register" : "login" });
  };

  const handleGoogleLogin = () => {
    window.location.href = authAPI.getGoogleLoginUrl();
  };

  const handleGithubLogin = () => {
    window.location.href = authAPI.getGithubLoginUrl();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { ok, data } = await authAPI.login(username, password);

        if (ok) {
          const profileCompleted = data.user.profile_completed;

          toast.success(`Welcome back, ${data.user.first_name || data.user.username}!`);

          // Route based on profile completion
          if (!profileCompleted) {
            navigate("/complete-profile");
          } else {
            navigate("/dashboard");
          }
        } else {
          toast.error(data.error || "Invalid credentials. Please try again.");
        }
      } else {
        // Register - validate passwords match
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        const { ok, data } = await authAPI.register({
          username: username,
          email: email,
          password: password,
          password_confirm: confirmPassword,
          first_name: name.split(" ")[0],
          last_name: name.split(" ").slice(1).join(" "),
        });

        if (ok) {
          toast.success("Account created! Let's set up your profile.");
          navigate("/complete-profile");
        } else {
          // Show validation errors
          const errors = Object.values(data).flat().join(". ");
          toast.error(errors || "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Connection error. Please check if the server is running.");
    }

    setIsLoading(false);
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-md animate-fade-up">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <img src="/hacklyn.png" alt="Hacklyn" className="w-10 h-10 object-contain" />
              <span className="font-display font-bold text-2xl">Hacklyn</span>
            </Link>
          </div>

          <Card variant="elevated">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {mode === "login" ? "Welcome back" : "Create an account"}
              </CardTitle>
              <CardDescription>
                {mode === "login"
                  ? "Sign in to access your dashboard"
                  : "Get started with your free account"
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center gap-3"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center gap-3"
                  onClick={handleGithubLogin}
                >
                  <Github className="w-5 h-5" />
                  Continue with GitHub
                </Button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (Register only) */}
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Email (Register only) */}
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Register only) */}
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Please wait..."
                  ) : mode === "login" ? (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {/* Toggle Mode */}
                <p className="text-center text-sm text-muted-foreground">
                  {mode === "login" ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="text-primary font-medium hover:underline"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="text-primary font-medium hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Info text */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to Hacklyn's Terms of Service and Privacy Policy
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
