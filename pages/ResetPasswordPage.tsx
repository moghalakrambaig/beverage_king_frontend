import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.resetPassword(token, newPassword);
      setMessage(res.message);
      setTimeout(() => navigate("/login"), 3000); // Redirect to login
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-50">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-xl border border-yellow-200">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4 text-center">Reset Password</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="newPassword" className="text-yellow-700">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-xl shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-yellow-700">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-xl shadow-sm"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-3 text-center">{message}</p>}

        <Button
          onClick={handleResetPassword}
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 font-semibold rounded-xl shadow-lg hover:from-yellow-500 hover:to-yellow-700"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </div>
  );
}
