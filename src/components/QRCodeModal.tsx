
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Item } from "@/types/item";

interface QRCodeModalProps {
  item: Item;
  onClose: () => void;
}

export const QRCodeModal = ({ item, onClose }: QRCodeModalProps) => {
  // Generate QR code URL (using a QR code service)
  const itemUrl = `${window.location.origin}/item/${item.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(itemUrl)}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${item.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.name} - Rackis for Barn`,
          text: `Check out this item: ${item.name}`,
          url: itemUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(itemUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>QR Code for {item.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <img 
              src={qrCodeUrl} 
              alt={`QR Code for ${item.name}`}
              className="border rounded-lg"
            />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Scan this QR code to view item details
            </p>
            <p className="text-xs text-gray-500 break-all">
              {itemUrl}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Print this QR code and attach it to the physical item for easy identification.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
