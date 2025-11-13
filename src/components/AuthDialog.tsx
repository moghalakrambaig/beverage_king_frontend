import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Wine, Eye, EyeOff } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignUp?: (username: string, email: string, password: string, mobile: string) => Promise<void>;
  onSignIn?: (email: string, password: string) => Promise<void>;
}

export const AuthDialog = ({ open, onOpenChange, onSignUp, onSignIn }: AuthDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const username = formData.get("full-name") as string;
    const mobile = formData.get("signup-mobile") as string;

    if (!email || !password || !mobile) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      if (onSignUp) await onSignUp(username, email, password, mobile);
      toast({ title: "Success", description: "Account created successfully!" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Sign Up Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
      if (onSignIn) await onSignIn(email, password);
      toast({ title: "Welcome Back!", description: "Signed in successfully." });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Sign In Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

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
      // 🔗 call your backend endpoint
      const res = await fetch("http://localhost:8083/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }), // send email in JSON body
      });


      if (!res.ok) throw new Error("Failed to send reset link");

      toast({
        title: "Email Sent!",
        description: "A password reset link has been sent to your email.",
      });
      setForgotPasswordOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
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
          <DialogTitle className="text-2xl text-center">Join the Insiders Club</DialogTitle>
          <DialogDescription className="text-center">
            Get exclusive early access to barrel drops and special releases
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* SIGN IN TAB */}
          {/* SIGN IN TAB */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="flex items-center relative">
                  <Input
                    id="signin-password"
                    name="signin-password"
                    type={showSignInPassword ? "text" : "password"}
                    placeholder="••••••••"
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

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              {/* 👉 NEW: Forgot password link */}
              <div className="text-center mt-2">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Forgot password?
                </button>
              </div>
            </form>

            {/* 👉 NEW: Forgot Password Dialog */}
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
                      <Input
                        id="forgot-email"
                        name="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="bg-background"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>


          {/* SIGN UP TAB */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name (Optional)</Label>
                <Input id="full-name" name="full-name" type="text" placeholder="John Doe" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-mobile">Mobile Number</Label>
                <Input
                  id="signup-mobile"
                  name="signup-mobile"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="signup-password"
                  type={showSignUpPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="bg-background pr-10"
                />
                <button
                  type="button"
                  aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute inset-y-0 right-3 flex items-center focus:outline-none"
                >
                  {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
