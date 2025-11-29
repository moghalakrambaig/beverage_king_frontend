import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { DiscordSection } from "@/components/DiscordSection";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import bkLogo from "@/assets/bk-logo.jpg";
import { api } from "@/lib/api"; // your backend API wrapper
import { Share2, Facebook, Twitter, Send, MessageCircle, Instagram, Users } from "lucide-react";


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

  const shareUrl = "https://beveragekingct.com";
  const shareText = "Check out the Beverage King Insiders Club! 🍷🔥";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Beverage King Insiders Club",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      alert("Sharing not supported on this device. Use the icons below!");
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-baseline gap-3">
            <img
              src={bkLogo}
              alt="BEVERAGE KING"
              className="w-12 h-12 object-contain rounded-lg shadow-lg transition-transform duration-300 hover:scale-110"
            />

            <span className="relative" style={{ top: "-4px" }}>
              <span className="text-3xl sm:text-4xl font-extrabold font-cursive
      bg-gradient-to-r from-primary via-accent to-primary bg-clip-text
      text-transparent animate-gradient leading-none">
                Beverage King
              </span>
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

                {/* Prominent Edit Profile button */}
                <Button
                  onClick={() => navigate(`/customer-details/${user.id}`)}
                  size="sm"
                  className="ml-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Edit Profile
                </Button>

                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="ml-2 border-primary/30 hover:bg-primary/10"
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
                  onClick={() => {
                    navigate(`/customer-details/${user.id}`);
                    setIsMobileMenuOpen(false);
                  }}
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Edit Profile
                </Button>

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
        {/* Share sidebar removed per request */}
      </main>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">

          {/* Modern Share Box */}
          <div className="mt-6 flex flex-col items-center gap-4">

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="
          flex items-center gap-2 px-6 py-3 rounded-full
          bg-gradient-to-r from-primary via-purple-500 to-pink-500
          text-white font-semibold shadow-lg
          hover:scale-105 hover:shadow-xl
          transition-all duration-300
        "
            >
              <Share2 className="w-5 h-5" />
              Share This Website
            </button>

            {/* Social Icons Row */}
            <div className="flex items-center gap-6 mt-2 justify-center">

              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-all"
              >
                <MessageCircle className="w-6 h-6 text-green-500" />
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-all"
              >
                <Send className="w-6 h-6 text-blue-500" />
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-600/20 hover:bg-blue-600/30 transition-all"
              >
                <Facebook className="w-6 h-6 text-blue-600" />
              </a>

              {/* Twitter/X */}
<a
  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="p-3 rounded-full bg-blue-600/20 hover:bg-blue-600/30 transition-all flex items-center justify-center"
>
  <Twitter className="w-6 h-6 text-blue-500" />
</a>


              {/* Discord (Lucide placeholder) */}
              <a
                href="https://discord.gg/YOUR_SERVER_INVITE" // Replace with your Discord invite link
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 transition-all"
              >
                <Users className="w-6 h-6 text-indigo-500" />
              </a>


              {/* Instagram */}
              <a
                href="https://www.instagram.com/beverage_king" // Replace with your IG
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-pink-500/20 hover:bg-pink-500/30 transition-all"
              >
                <Instagram className="w-6 h-6 text-pink-500" />
              </a>

            </div>


          </div>

          {/* Footer Text */}
          <p className="mt-6 text-sm">© 2025 Beverage King. All rights reserved.</p>
        </div>
      </footer>



      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onSignIn={handleSignIn}
      />
    </div>
  );
};

export default Index;
