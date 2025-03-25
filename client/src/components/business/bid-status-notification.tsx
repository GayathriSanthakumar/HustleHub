import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReviveBidForm } from "@/components/business/revive-bid-form";

interface BidNotificationProps {
  businessId: number;
}

type NotificationType = "accepted" | "replaced" | "rejected";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  bid: any;
  timestamp: Date;
  isNew?: boolean;
}

export function BidStatusNotification({ businessId }: BidNotificationProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());

  // Fetch bids using React Query for better caching and real-time updates
  const { data: bids, isLoading: bidsLoading } = useQuery({
    queryKey: ["/api/bids/business"],
    queryFn: async () => {
      const response = await fetch(`/api/bids/business`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }
      
      return response.json();
    },
    // Refresh data every 20 seconds
    refetchInterval: 20000,
    onSuccess: (data) => {
      // Process notifications with fetched bid data
      const currentTime = new Date();
      processNotifications(data, lastFetchTime);
      setLastFetchTime(currentTime);
    }
  });
  
  // Fetch additional item data to show names instead of just IDs
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    }
  });
  
  // Get item name from its ID
  const getItemName = (itemId: number, itemType: string) => {
    if (itemType === "product" && products) {
      const product = products.find((p: any) => p.id === itemId);
      return product ? product.name : `Item #${itemId}`;
    }
    
    return `Item #${itemId}`;
  };
  
  // Process bids to generate notifications
  const processNotifications = (bids: any[], lastCheck: Date) => {
    if (!bids || !Array.isArray(bids)) return;
    
    const newNotifications: Notification[] = [];
    const lastCheckTime = lastCheck.getTime();
    
    // Find accepted bids with updates since last check
    const acceptedBids = bids.filter(bid => 
      bid.status === "accepted" && 
      new Date(bid.updatedAt || bid.createdAt).getTime() > lastCheckTime
    );
    
    if (acceptedBids.length > 0) {
      acceptedBids.forEach(bid => {
        const itemName = getItemName(bid.itemId, bid.itemType);
        newNotifications.push({
          id: `accepted-${bid.id}`,
          type: "accepted",
          message: `Your bid for "${itemName}" has been accepted!`,
          bid: bid,
          timestamp: new Date(bid.updatedAt || bid.createdAt),
          isNew: true
        });
      });
    }
    
    // Find rejected bids that were replaced by lower bids
    const replacedBids = bids.filter(bid => 
      bid.status === "rejected" && 
      bid.replacedBy !== null &&
      new Date(bid.updatedAt || bid.createdAt).getTime() > lastCheckTime
    );
    
    if (replacedBids.length > 0) {
      replacedBids.forEach(bid => {
        const itemName = getItemName(bid.itemId, bid.itemType);
        newNotifications.push({
          id: `replaced-${bid.id}`,
          type: "replaced",
          message: `Your bid for "${itemName}" was replaced by a lower bid.`,
          bid: bid,
          timestamp: new Date(bid.updatedAt || bid.createdAt),
          isNew: true
        });
      });
    }
    
    // Find directly rejected bids (without being replaced)
    const directlyRejectedBids = bids.filter(bid => 
      bid.status === "rejected" && 
      bid.replacedBy === null &&
      new Date(bid.updatedAt || bid.createdAt).getTime() > lastCheckTime
    );
    
    if (directlyRejectedBids.length > 0) {
      directlyRejectedBids.forEach(bid => {
        const itemName = getItemName(bid.itemId, bid.itemType);
        newNotifications.push({
          id: `rejected-${bid.id}`,
          type: "rejected",
          message: `Your bid for "${itemName}" was rejected.`,
          bid: bid,
          timestamp: new Date(bid.updatedAt || bid.createdAt),
          isNew: true
        });
      });
    }
    
    // Use a Set to track unique notification IDs
    const existingIds = new Set(notifications.map(n => n.id));
    const newUniqueNotifications = newNotifications.filter(n => !existingIds.has(n.id));
    
    if (newUniqueNotifications.length > 0) {
      // Add new notifications to the top of the list
      setNotifications(prev => [...newUniqueNotifications, ...prev]);
      setNotificationCount(prev => prev + newUniqueNotifications.length);
      
      // Show toast for new notifications
      newUniqueNotifications.forEach(notification => {
        const toastVariant = 
          notification.type === "accepted" ? "default" :
          notification.type === "replaced" ? "destructive" : 
          "secondary";
        
        toast({
          title: notification.type === "accepted" ? "Bid Accepted!" : 
                notification.type === "replaced" ? "Bid Replaced" : "Bid Rejected",
          description: notification.message,
          variant: toastVariant
        });
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
      
      {showNotifications && (
        <Card className="absolute right-0 mt-2 z-50 w-96 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm font-medium">Bid Notifications</CardTitle>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            {bidsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No bid notifications</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {notifications.map((notification, index) => (
                  <AccordionItem 
                    key={notification.id} 
                    value={`item-${index}`}
                    className={notification.isNew ? "bg-primary/5 rounded-md" : ""}
                  >
                    <AccordionTrigger className="text-sm py-2">
                      <div className="flex items-center gap-2">
                        {notification.type === "accepted" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : notification.type === "replaced" ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
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
                      
                      <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100">
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-semibold">Amount:</span> ₹{notification.bid.amount}
                        </p>
                        {notification.bid.details && (
                          <p className="text-sm text-gray-600">{notification.bid.details}</p>
                        )}
                        {notification.bid.deliveryTime && (
                          <p className="text-xs text-gray-500 mt-1">
                            Delivery time: {notification.bid.deliveryTime}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
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
                              {notification.type === "replaced" ? "Improve Offer" : "Submit New Offer"}
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
            )}
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