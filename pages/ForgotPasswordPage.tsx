import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await api.forgotPassword(email); // Call Spring Boot backend
      setMessage(res.message || "If this email exists, a reset link has been sent.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-50">
      <div className="relative w-full max-w-md p-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-yellow-200">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-800">Reset Password</h2>
          <p className="text-yellow-600 mt-1 text-sm">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Email Input */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="email" className="font-medium text-yellow-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-xl shadow-sm pr-4 placeholder-yellow-400 hover:border-yellow-400 transition"
            />
          </div>
        </div>

        {/* Error & Success Messages */}
        {error && <p className="text-red-500 text-sm mt-3 text-center font-medium">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-3 text-center font-medium">{message}</p>}

        {/* Submit Button */}
        <Button
          onClick={handleForgotPassword}
          disabled={loading || !email.trim()}
          className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 font-semibold rounded-xl shadow-lg hover:from-yellow-500 hover:to-yellow-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-yellow-900"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          )}
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>

        {/* Footer: Back to Login */}
        <p className="mt-6 text-center text-yellow-600 text-sm">
          Remembered your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="underline hover:text-yellow-800"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
