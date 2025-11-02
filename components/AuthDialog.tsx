import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Wine } from "lucide-react";


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

    // Basic mobile validation (10-15 digits, can be improved)
    const mobileRegex = /^\d{10,15}$/;
    if (!email || !password || !mobile) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!mobileRegex.test(mobile)) {
      toast({ title: "Invalid Mobile Number", description: "Enter a valid mobile number (10-15 digits)", variant: "destructive" });
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
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input id="signin-email" name="signin-email" type="email" placeholder="you@example.com" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative flex items-center">
                  <Input id="signin-password" name="signin-password" type={showSignInPassword ? "text" : "password"} placeholder="••••••••" required className="bg-background pr-16" />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showSignInPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 px-2 py-1 rounded text-xs font-medium text-primary bg-muted border border-input shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => setShowSignInPassword((v) => !v)}
                  >
                    {showSignInPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
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
                <Input id="signup-email" name="signup-email" type="email" placeholder="you@example.com" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-mobile">Mobile Number</Label>
                <Input id="signup-mobile" name="signup-mobile" type="tel" placeholder="e.g. 9876543210" required className="bg-background" pattern="[0-9]{10,15}" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative flex items-center">
                  <Input id="signup-password" name="signup-password" type={showSignUpPassword ? "text" : "password"} placeholder="••••••••" required className="bg-background pr-16" />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 px-2 py-1 rounded text-xs font-medium text-primary bg-muted border border-input shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => setShowSignUpPassword((v) => !v)}
                  >
                    {showSignUpPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};