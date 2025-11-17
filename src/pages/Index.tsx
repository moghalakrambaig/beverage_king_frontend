import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { DiscordSection } from "@/components/DiscordSection";
import { AuthDialog } from "@/components/AuthDialog";
import { ShareSidebar } from "@/components/ShareSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load user session
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const customer = JSON.parse(storedUser);
      setUser(customer);
      setPoints(customer.points || 0);
      setTotalEarned(customer.points || 0);
    }
  }, []);

  // Sign Up
  const handleSignUp = async (username: string, email: string, password: string, mobile: string) => {
    try {
      const res = await api.signup(username, email, password, mobile);
      const customer = res.data;

      // Save session
      sessionStorage.setItem("user", JSON.stringify(customer));
      setUser(customer);
      setPoints(customer.points || 0);
      setTotalEarned(customer.points || 0);

      toast({ title: "Welcome!", description: "Account created successfully." });

      // 👉 Redirect to dashboard AFTER signup
      navigate(`/customer-dashboard/${customer.id}`);

    } catch (err: any) {
      toast({ title: "Sign up failed", description: err.message, variant: "destructive" });
    }
  };


  // Sign In
  // Sign In
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

      // Redirect to customer dashboard
      navigate(`/customer-dashboard/${customer.id}`);
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message || "Invalid credentials", variant: "destructive" });
    }
  };


  // Sign Out
  const handleSignOut = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setPoints(0);
    setTotalEarned(0);
    toast({ title: "Signed out", description: "You've successfully signed out." });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={bkLogo}
              alt="Beverage King"
              className="w-12 h-12 object-contain rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
            />
            <span className="text-3xl sm:text-4xl font-bold font-cursive bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Beverage King
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4">

            {user ? (
              <>
                <div
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  onClick={() => navigate(`/customer-details/${user.id}`)}
                >
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground hover:underline">
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
              <>
                <Button
                  onClick={() => setAuthDialogOpen(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="sm:hidden p-2 rounded-md border border-border hover:bg-muted transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-md p-4 space-y-4 animate-in fade-in slide-in-from-top-4">

            {user ? (
              <>
                <div
                  onClick={() => {
                    navigate(`/customer-details/${user.id}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground hover:underline">
                    {user.cus_name || user.email}
                  </span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/30 hover:bg-primary/10"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setAuthDialogOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <Hero onGetStarted={() => !user && setAuthDialogOpen(true)} />
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
