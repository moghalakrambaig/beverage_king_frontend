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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-50">
      <div className="absolute inset-0 bg-yellow-50 bg-[url('/pattern.svg')] opacity-10 pointer-events-none"></div>

      <div className="relative w-full max-w-md p-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-yellow-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-yellow-800 hover:text-yellow-900 transition text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-yellow-800 drop-shadow-sm">
            Admin Login
          </h2>
          <div className="mt-3 h-1 w-20 bg-yellow-400 rounded-full mx-auto shadow-sm"></div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="font-medium text-yellow-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@beverageking.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-xl shadow-sm placeholder-yellow-400 hover:border-yellow-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="font-medium text-yellow-700">
              Password
            </Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-xl shadow-sm pr-10 placeholder-yellow-400 hover:border-yellow-400 transition"
              />
              {/* 👁 Show/Hide password icon inside input */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 hover:text-yellow-800 transition"
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
          className="w-full mt-8 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 font-semibold rounded-xl shadow-lg hover:from-yellow-500 hover:to-yellow-700 active:scale-95 transition-all"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {/* Optional footer text */}
        <p className="mt-6 text-center text-yellow-600 text-sm">
          Forgot your password?{" "}
          <button
            onClick={() => navigate("/forgot-password")}
            className="underline hover:text-yellow-800"
          >
            Reset here
          </button>
        </p>
      </div>
    </div>
  );
}
