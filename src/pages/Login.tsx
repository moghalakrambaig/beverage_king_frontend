import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await api.adminLogin(email, password);
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("password", password);
      setLoading(false);
      navigate("/admin");
    } catch (err) {
      setError("Invalid email or password");
      setLoading(false);
      console.error(err);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5 pointer-events-none"></div>

      <div className="relative w-full max-w-md p-10 bg-card/90 backdrop-blur-md rounded-3xl shadow-2xl border border-border">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-primary hover:text-primary/90 transition text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-primary drop-shadow-sm">
            Admin Login
          </h2>
          <div className="mt-3 h-1 w-20 bg-primary/60 rounded-full mx-auto shadow-sm"></div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="font-medium text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@beverageking.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-border focus:ring-primary focus:border-primary rounded-xl shadow-sm placeholder:text-muted-foreground hover:border-border transition"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="font-medium text-muted-foreground">
              Password
            </Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-border focus:ring-primary focus:border-primary rounded-xl shadow-sm pr-10 placeholder:text-muted-foreground hover:border-border transition"
              />
              {/* 👁 Show/Hide password icon inside input */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/80 hover:text-primary transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mt-3 text-center font-medium">
            {error}
          </p>
        )}

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          className="w-full mt-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg active:scale-95 transition-all"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {/* Optional footer text */}
        <p className="mt-6 text-center text-muted-foreground text-sm">
          Want to reset your password?{" "}
          <button
            onClick={() => navigate("/forgot-password")}
            className="underline hover:text-yellow-800"
          >
            Click here
          </button>
        </p>
      </div>
    </div>
  );
}
