import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import bkLogo from "@/assets/bk-logo.jpg";
import { LogOut, Crown, Bell, Sparkles, GlassWater } from "lucide-react";
import { DiscordSection } from "@/components/DiscordSection";

type Customer = {
  id: string;
  Name: string;
  Email: string;
  earnedPoints: number;
  phone?: string
};

export default function CustomerDashboard() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await api.getCustomerById(id);

        // ---------------------------
        // FIX: MAP BACKEND FIELDS HERE
        // ---------------------------
        const mapped: Customer = {
          id: res.id || res._id || id,
          Name: res.Name || res.name || res.fullName || res.dynamicFields?.Name || `${res.firstName || ""} ${res.lastName || ""}`.trim(),
          Email: res.email || res.email || res.dynamicFields?.Email || res.dynamicFields?.email || "",
          earnedPoints: res.dynamicFields?.earnedPoints || res.dynamicFields?.EarnedPoints || res.dynamicFields?.points || res.earnedPoints || res.dynamicFields?.points || 0,
          phone: res.Phone || res.phone || res.mobile || res.dynamicFields?.mobile || res.dynamicFields?.Phone || res.dynamicFields?.phone || "N/A",
        };

        setCustomer(mapped);
      } catch (e) {
        console.error(e);
        navigate("/");
      }
    }

    load();
  }, [id, navigate]);

  if (!customer)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="p-8 text-center text-muted-foreground font-semibold">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-5 min-h-[4rem] flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3 overflow-visible">

            <img
              src={bkLogo}
              alt="BEVERAGE KING"
              className="w-12 h-12 object-contain rounded-lg shadow-lg transition-transform duration-300 hover:scale-110 align-middle"
            />

            <span
              className="inline-block align-middle text-3xl sm:text-4xl font-extrabold font-cursive 
                   leading-[1.05] translate-y-[1px] pb-1
                   bg-gradient-to-r from-primary via-accent to-primary 
                   bg-clip-text text-transparent animate-gradient"
            >
              Beverage King
            </span>

          </Link>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem("user");
                navigate("/");
              }}
            >
              <LogOut className="w-4 h-4" /> Log Out
            </Button>
          </div>

        </div>
      </header>


      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center my-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Welcome, {customer.Name}!
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Here’s your account overview and curated picks.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm flex flex-col items-center text-center">
              <h2 className="text-2xl font-semibold mb-2">Total Points</h2>
              <p className="text-5xl font-bold mb-2 text-foreground">{customer.earnedPoints}</p>
              <p className="text-muted-foreground">Points earned so far</p>
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
              <p className="mb-2">
                <strong className="text-foreground">Name:</strong>{" "}
                <span className="text-muted-foreground">{customer.Name}</span>
              </p>
              <p className="mb-2">
                <strong className="text-foreground">Email:</strong>{" "}
                <span className="text-muted-foreground">{customer.Email}</span>
              </p>
              <p className="mb-2">
                <strong className="text-foreground">Mobile:</strong>{" "}
                <span className="text-muted-foreground">{customer.phone}</span>
              </p>
            </div>
          </div>


          {/* Exclusive Deals removed per request */}

          <div className="max-w-5xl mx-auto mt-12">
            <h2 className="text-3xl font-bold mb-4">Explore More</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <a href="https://beveragekingct.com/shop/?tags=single%20barrels" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl bg-card border border-border hover:border-primary transition-all flex flex-col items-center">
                <Crown className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-semibold">Single Barrels</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">Unique expressions from single casks — limited and special.</p>
              </a>

              <a href="https://beveragekingct.com/" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl bg-card border border-border hover:border-primary transition-all flex flex-col items-center">
                <Bell className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-semibold">Special Releases</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">First looks at limited bottles and rare finds.</p>
              </a>

              <a href="https://beveragekingct.com/shop/?category=our_new_arrivals&title=New%20Arrivals" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl bg-card border border-border hover:border-primary transition-all flex flex-col items-center">
                <Sparkles className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-semibold">New Arrivals</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">See what's new on the shelf and get notified of releases.</p>
              </a>

              <a href="https://beveragekingct.com/events" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl bg-card border border-border hover:border-primary transition-all flex flex-col items-center">
                <GlassWater className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-semibold">Tasting & Events</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">Join tastings, events and meet the experts behind the pour.</p>
              </a>
            </div>
          </div>

          <div className="max-w-5xl mx-auto mt-12">
            <DiscordSection />
          </div>

        </div>
      </main>
    </div>
  );
}
