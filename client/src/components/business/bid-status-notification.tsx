import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    
    // Find rejected bids that can be revived (replaced by lower bids)
    const rejectedBids = bids.filter(bid => 
      bid.status === "rejected" && bid.replacedBy !== null
    );
    
    if (rejectedBids.length > 0) {
      rejectedBids.forEach(bid => {
        newNotifications.push({
          id: `rejected-${bid.id}`,
          type: "replaced",
          message: `Your bid #${bid.id} was replaced by a lower bid. You can submit an improved offer.`,
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
        toast({
          title: notification.type === "accepted" ? "Bid Accepted!" : "Bid Replaced",
          description: notification.message,
          variant: notification.type === "accepted" ? "default" : "destructive",
        });
      });
    }
  };
  
  // Handle bid revival
  const handleReviveBid = async (bidId: number) => {
    // Navigate to bid revival form or show modal
    console.log("Reviving bid:", bidId);
    // Implement navigation to a form where the business can submit an improved offer
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
                      <Badge variant={notification.type === "accepted" ? "success" : "secondary"}>
                        {notification.type === "accepted" ? "Accepted" : "Replaced"}
                      </Badge>
                      
                      <div className="flex gap-2">
                        {notification.type === "replaced" && (
                          <Button variant="outline" size="sm" className="h-8" onClick={() => handleReviveBid(notification.bid.id)}>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Improve
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
    </div>
  );
}