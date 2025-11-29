import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wine, Eye, EyeOff } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignIn?: (email: string, password: string) => Promise<void> | void;
}

export const AuthDialog = ({ open, onOpenChange, onSignIn }: AuthDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const { toast } = useToast();

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // ==================== Sign In ====================
  // Keep a local fallback sign-in implementation but prefer the parent-provided onSignIn.
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      // Send as JSON to match backend expectation
      const res = await fetch(`${BASE_URL}/api/auth/customer-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }), // Convert to JSON
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Invalid credentials";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await res.json();
      toast({ title: "Welcome Back!", description: "Signed in successfully." });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Sign In Failed", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ==================== Forgot Password ====================
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("forgot-email") as string;

    if (!email) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      setForgotLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send reset link");

      toast({ title: "Email Sent!", description: "A password reset link has been sent to your email." });
      setForgotPasswordOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wine className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">Sign in to your account</DialogTitle>
          <DialogDescription className="text-center">
            Enter your email and password to access the Insiders Club
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            // If parent passed in an onSignIn handler (Index.handleSignIn), call that.
            if (onSignIn) {
              e.preventDefault();
              setLoading(true);
              try {
                const formData = new FormData(e.currentTarget);
                const email = formData.get("signin-email") as string;
                const password = formData.get("signin-password") as string;

                if (!email || !password) {
                  toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
                  return;
                }

                await onSignIn(email, password);
                onOpenChange(false);
              } catch (err: any) {
                toast({ title: "Sign In Failed", description: err?.message || "Something went wrong", variant: "destructive" });
              } finally {
                setLoading(false);
              }
            } else {
              // Fallback to local implementation
              await handleSignIn(e as React.FormEvent<HTMLFormElement>);
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input id="signin-email" name="signin-email" type="email" required className="bg-background" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <div className="flex items-center relative">
              <Input
                id="signin-password"
                name="signin-password"
                type={showSignInPassword ? "text" : "password"}
                required
                className="bg-background pr-10 w-full"
              />
              <button
                type="button"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
                className="absolute right-3 flex items-center justify-center h-full focus:outline-none"
                aria-label={showSignInPassword ? "Hide password" : "Show password"}
              >
                {showSignInPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center mt-2">
            <button type="button" className="text-sm text-primary hover:underline" onClick={() => setForgotPasswordOpen(true)}>
              Forgot password?
            </button>
          </div>
        </form>

        {forgotPasswordOpen && (
          <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
            <DialogContent className="sm:max-w-sm bg-card border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-lg text-center">Reset Password</DialogTitle>
                <DialogDescription className="text-center">
                  Enter your email address to receive a reset link.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input id="forgot-email" name="forgot-email" type="email" required className="bg-background" />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={forgotLoading}>
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};
