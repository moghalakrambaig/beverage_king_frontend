import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Bell, Instagram, Glasses, GlassWater } from "lucide-react";
import bkLogo from "@/assets/bk-logo.jpg";
import { Link } from "react-router-dom";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.1),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--secondary)/0.3),transparent)]" />

      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center">

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img
              src={bkLogo}
              alt="Beverage King Insiders Club"
              className="w-48 h-48 object-contain rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Main heading */}
          <h1 className="mb-8 text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Insiders Club
            </span>
          </h1>

          {/* Subheading */}
          <p className="mb-10 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            This isn't your typical rewards or loyalty program — no points, no punches, no complicated rules.
            We're not asking you to prove your loyalty. All we're asking is that you show up, sign up, and get in on the good stuff before anyone else.
          </p>

          {/* VIP Message */}
          <p className="mb-10 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get exclusive early access to barrel drops, first looks at special releases, and behind-the-scenes updates
            on what we're working on. This is your VIP pass to everything happening at the crown jewel of spirits.
          </p>

{/* Pre-registration form section */}
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="mb-4 text-lg font-semibold text-foreground">
            Please Complete IOur Pre-Registration Form Before Signing Up.
          </p>
          <a
            href="https://docs.google.com/forms/d/1a_ULcBtE65z9YqTBD0HqXLEHN6nTcsiU5aqqSPErv2s/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors"
          >
            Pre-Registration Form
          </a>
        </div>

          {/* Feature highlights */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">

  <a
    href="https://beveragekingct.com/shop/?tags=single%20barrels"
    target="_blank"
    rel="noopener noreferrer"
    className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border 
               hover:border-primary/50 transition-all h-full min-h-[280px] 
               flex flex-col cursor-pointer hover:shadow-lg"
  >
    <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-center">Single Barrels</h3>
    <p className="text-muted-foreground text-center">
      Single barrels offer a uniquely crafted expression, showcasing the distinct character drawn from just one exceptional cask.
    </p>
  </a>

  <a
    href="https://beveragekingct.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border 
               hover:border-primary/50 transition-all h-full min-h-[280px] 
               flex flex-col cursor-pointer hover:shadow-lg"
  >
    <Bell className="w-12 h-12 text-primary mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-center">Special Releases</h3>
    <p className="text-muted-foreground text-center">
      First looks at limited bottles and rare finds.
    </p>
  </a>

  <a
    href="https://beveragekingct.com/shop/?category=our_new_arrivals&title=New%20Arrivals"
    target="_blank"
    rel="noopener noreferrer"
    className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border 
               hover:border-primary/50 transition-all h-full min-h-[280px] 
               flex flex-col cursor-pointer hover:shadow-lg"
  >
    <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-center">New Arrivals</h3>
    <p className="text-muted-foreground text-center">
      New arrivals bring fresh, exciting selections that highlight the latest additions.
    </p>
  </a>

  <a
    href="https://beveragekingct.com/events"
    target="_blank"
    rel="noopener noreferrer"
    className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border 
               hover:border-primary/50 transition-all h-full min-h-[280px] 
               flex flex-col cursor-pointer hover:shadow-lg"
  >
    <GlassWater className="w-12 h-12 text-primary mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-center">Tasting & Events</h3>
    <p className="text-muted-foreground text-center">
      Tasting & Events provide immersive experiences that let you explore flavors and connect with experts.
    </p>
  </a>

</div>


         {/* Instagram section */}
<div className="mt-8 flex flex-col items-center text-center">
  <a
    href="https://www.instagram.com/beverage_king?igsh=bGlmcHp1NWM1NWVi"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
               px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
  >
    <Instagram className="w-6 h-6" />
    <span>Follow us on Instagram for all the latest details!</span>
  </a>
</div>

        

        </div>
      </div>
    </div>
  );
};
