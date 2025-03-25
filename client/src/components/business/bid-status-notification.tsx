import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReviveBidForm } from "@/components/business/revive-bid-form";

interface BidNotificationProps {
  businessId: number;
}

export function BidStatusNotification({ businessId }: BidNotificationProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch bid data initially and set up polling for updates
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await fetch(`/api/bids/business`, {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch bids");
        }
        
        const bids = await response.json();
        processNotifications(bids);
      } catch (error) {
        console.error("Error fetching bids:", error);
      }
    };
    
    // Initial fetch
    fetchBids();
    
    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchBids, 30000);
    
    return () => clearInterval(intervalId);
  }, [businessId]);
  
  // Process bids to generate notifications
  const processNotifications = (bids: any[]) => {
    const newNotifications = [];
    
    // Find accepted bids
    const acceptedBids = bids.filter(bid => bid.status === "accepted");
    if (acceptedBids.length > 0) {
      acceptedBids.forEach(bid => {
        newNotifications.push({
          id: `accepted-${bid.id}`,
          type: "accepted",
          message: `Your bid for item #${bid.itemId} has been accepted!`,
          bid: bid,
          timestamp: new Date(bid.createdAt)
        });
      });
    }
    
    // Find rejected bids that were replaced by lower bids
    const replacedBids = bids.filter(bid => 
      bid.status === "rejected" && bid.replacedBy !== null
    );
    
    if (replacedBids.length > 0) {
      replacedBids.forEach(bid => {
        newNotifications.push({
          id: `replaced-${bid.id}`,
          type: "replaced",
          message: `Your bid #${bid.id} was replaced by a lower bid. You can submit an improved offer.`,
          bid: bid,
          timestamp: new Date(bid.createdAt)
        });
      });
    }
    
    // Find directly rejected bids (without being replaced)
    const directlyRejectedBids = bids.filter(bid => 
      bid.status === "rejected" && bid.replacedBy === null
    );
    
    if (directlyRejectedBids.length > 0) {
      directlyRejectedBids.forEach(bid => {
        newNotifications.push({
          id: `rejected-${bid.id}`,
          type: "rejected",
          message: `Your bid #${bid.id} was rejected. You can submit a new offer.`,
          bid: bid,
          timestamp: new Date(bid.createdAt)
        });
      });
    }
    
    // Use a Set to track unique notification IDs
    const existingIds = new Set(notifications.map(n => n.id));
    const newUniqueNotifications = newNotifications.filter(n => !existingIds.has(n.id));
    
    if (newUniqueNotifications.length > 0) {
      setNotifications(prev => [...newUniqueNotifications, ...prev]);
      setNotificationCount(prev => prev + newUniqueNotifications.length);
      
      // Show toast for new notifications
      newUniqueNotifications.forEach(notification => {
        const toastData = {
          title: "Bid Status Update",
          description: notification.message,
          variant: "default" as const
        };
        
        // Customize based on notification type
        if (notification.type === "accepted") {
          toastData.title = "Bid Accepted!";
          toastData.variant = "default" as const;
        } else if (notification.type === "replaced") {
          toastData.title = "Bid Replaced";
          toastData.variant = "destructive" as const;
        } else if (notification.type === "rejected") {
          toastData.title = "Bid Rejected";
          toastData.variant = "secondary" as const;
        }
        
        toast(toastData);
      });
    }
  };
  
  // State for revive bid modal
  const [reviveModalOpen, setReviveModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);

  // Handle bid revival
  const handleReviveBid = async (bid: any) => {
    setSelectedBid(bid);
    setReviveModalOpen(true);
  };
  
  // Mark notification as read
  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setNotificationCount(prev => Math.max(0, prev - 1));
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setNotificationCount(0);
    setShowNotifications(false);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </Button>
      
      {showNotifications && notifications.length > 0 && (
        <Card className="absolute right-0 mt-2 z-50 w-80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="max-h-80 overflow-auto">
            <Accordion type="single" collapsible className="w-full">
              {notifications.map((notification, index) => (
                <AccordionItem key={notification.id} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm py-2">
                    <div className="flex items-center gap-2">
                      {notification.type === "accepted" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-left">{notification.message}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge 
                        variant={
                          notification.type === "accepted" ? "success" : 
                          notification.type === "replaced" ? "destructive" : 
                          "secondary"
                        }
                      >
                        {notification.type === "accepted" ? "Accepted" : 
                         notification.type === "replaced" ? "Replaced" : "Rejected"}
                      </Badge>
                      
                      <div className="flex gap-2">
                        {(notification.type === "replaced" || notification.type === "rejected") && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-8 ${notification.type === "replaced" ? "bg-primary text-white hover:bg-primary/90" : ""}`} 
                            onClick={() => handleReviveBid(notification.bid)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {notification.type === "replaced" ? "Improve" : "New Offer"}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8" onClick={() => clearNotification(notification.id)}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
      
      {/* Revive Bid Form Modal */}
      {selectedBid && (
        <ReviveBidForm
          bidId={selectedBid.id}
          originalBid={selectedBid}
          isOpen={reviveModalOpen}
          onClose={() => {
            setReviveModalOpen(false);
            setSelectedBid(null);
            
            // Refresh bids data
            queryClient.invalidateQueries({ queryKey: ["/api/bids/business"] });
          }}
        />
      )}
    </div>
  );
}