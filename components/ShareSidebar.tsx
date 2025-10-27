import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Facebook, Twitter, Linkedin, Mail, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const ShareSidebar = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const websiteUrl = window.location.origin;
  const shareTitle = "Join the Beverage King Insiders Club";
  const shareText = "Get exclusive early access to barrel drops and special releases at Beverage King!";

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: websiteUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(websiteUrl);
      toast({
        title: "Link copied!",
        description: "Website link has been copied to clipboard",
      });
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(websiteUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(websiteUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(websiteUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`${shareText}\n\n${websiteUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
  <div className="fixed right-0 top-1/2 -translate-y-1/2 z-60">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="default" 
            size="icon" 
            className="h-12 w-12 rounded-l-xl rounded-r-none bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-80 sm:w-96">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">Share & Connect</SheetTitle>
          </SheetHeader>
          
          {/* Share Buttons */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold mb-3">Share with Friends</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleWebShare}
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={shareOnFacebook}
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={shareOnTwitter}
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={shareOnLinkedIn}
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Scan to Visit</h3>
            <div className="bg-white p-4 rounded-xl w-fit mx-auto">
              <QRCodeSVG 
                value={websiteUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code to visit Beverage King Insiders Club
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};