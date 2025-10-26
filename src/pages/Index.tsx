import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { PointsDisplay } from "@/components/PointsDisplay";
import { DiscordSection } from "@/components/DiscordSection";
import { AuthDialog } from "@/components/AuthDialog";
import { ShareSidebar } from "@/components/ShareSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import bkLogo from "@/assets/bk-logo.jpg";
import { api } from "@/lib/api"; // your backend API wrapper

interface Customer {
  id: number;
  cus_name: string;
  email: string;
  mobile?: string;
  points: number;
}

const Index = () => {
  const [user, setUser] = useState<Customer | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const customer = JSON.parse(storedUser);
      setUser(customer);
      setPoints(customer.points || 0);
      setTotalEarned(customer.points || 0);
    }
  }, []);

  // Sign Up Handler
  const handleSignUp = async (username: string, email: string, password: string) => {
    try {
      const res = await api.signup(username, email, password);
      const customer = res.data;
      sessionStorage.setItem("user", JSON.stringify(customer));
      setUser(customer);
      setPoints(customer.points || 0);
      setTotalEarned(customer.points || 0);
      toast({ title: "Welcome!", description: "Account created successfully." });
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err.message, variant: "destructive" });
    }
  };

  // Sign In Handler
  const handleSignIn = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (!res.data) throw new Error("Invalid credentials");
      const customer = res.data;
      sessionStorage.setItem("user", JSON.stringify(customer));
      setUser(customer);
      setPoints(customer.points || 0);
      setTotalEarned(customer.points || 0);
      toast({ title: "Welcome back!", description: "Signed in successfully." });
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message || "Invalid credentials", variant: "destructive" });
    }
  };

  // Sign Out Handler
  const handleSignOut = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setPoints(0);
    setTotalEarned(0);
    toast({ title: "Signed out", description: "You've successfully signed out." });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={bkLogo}
              alt="Beverage King"
              className="w-12 h-12 object-contain rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
            />
            <span className="text-4xl font-bold font-cursive bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Beverage King
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Nav Options */}
            <div className="hidden sm:flex items-center gap-6 text-sm">
              <a href="#join-section" className="text-muted-foreground hover:text-primary transition-colors">
                Insiders Club
              </a>
              <a href="#discord-section" className="text-muted-foreground hover:text-primary transition-colors">
                Discord
              </a>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm cursor-pointer">
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span
                    className="text-muted-foreground hover:underline"
                    onClick={() => navigate(`/customer-details/${user.id}`)}
                  >
                    {user.cus_name || user.email}
                  </span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setAuthDialogOpen(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Sign In
                </Button>
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-white border-2 border-yellow-400 hover:bg-yellow-400/10 hover:text-white"
                  >
                    Admin
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-12">
        <Hero onGetStarted={() => !user && setAuthDialogOpen(true)} />

        {user ? (
          <PointsDisplay points={points} totalEarned={totalEarned} />
        ) : (
          <div id="join-section" className="py-16 px-4 text-center max-w-3xl mx-auto scroll-mt-24">
            <h2 className="text-3xl font-bold mb-6">Join the Insiders Club</h2>
            <p className="text-muted-foreground mb-6 text-lg max-w-3xl mx-auto">
              This is your VIP pass to everything happening at the crown jewel of spirits. 
              Join the Insiders Club today — and never miss a drop again.
            </p>
            <p className="text-muted-foreground mb-8 text-base">
              Ask the cashier how to sign up, or simply join during checkout!
            </p>
            <Button
              onClick={() => setAuthDialogOpen(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign Up Now
            </Button>
          </div>
        )}

        <div id="discord-section">
          <DiscordSection />
        </div>
        <ShareSidebar />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2024 Beverage King. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
      />
    </div>
  );
};

export default Index;
