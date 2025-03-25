import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviveBidForm } from "@/components/business/revive-bid-form";
import { Tag, User, Calendar, ArrowRight, Check, Clock, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export function BidCategories() {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [reviveModalOpen, setReviveModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);

  // Fetch all bids for the current business
  const { data: bids, isLoading: bidsLoading } = useQuery({
    queryKey: ["/api/bids/business"],
    queryFn: async () => {
      const response = await fetch("/api/bids/business", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch bids");
      return response.json();
    }
  });

  // Fetch additional product data to show names instead of just IDs
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get bid status badge
  const getBidStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "success" | "outline" | "destructive", label: string }> = {
      "pending": { variant: "secondary", label: "Pending" },
      "accepted": { variant: "success", label: "Accepted" },
      "rejected": { variant: "destructive", label: "Rejected" }
    };
    return statusMap[status] || { variant: "outline", label: status };
  };

  // Filter bids based on selected tab
  const getFilteredBids = () => {
    if (!bids) return [];
    
    if (selectedTab === "accepted") {
      return bids.filter((bid: any) => bid.status === "accepted");
    } else if (selectedTab === "pending") {
      return bids.filter((bid: any) => bid.status === "pending");
    } else if (selectedTab === "rejected") {
      return bids.filter((bid: any) => bid.status === "rejected");
    }
    
    return bids;
  };

  // Get item name from its ID
  const getItemName = (itemId: number, itemType: string) => {
    if (itemType === "product" && products) {
      const product = products.find((p: any) => p.id === itemId);
      return product ? product.name : `Item #${itemId}`;
    }
    
    return `Item #${itemId}`;
  };

  // Handle opening the revive bid modal
  const handleReviveBid = (bid: any) => {
    setSelectedBid(bid);
    setReviveModalOpen(true);
  };

  const filteredBids = getFilteredBids();

  return (
    <>
      <Tabs 
        defaultValue="all" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All Bids</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-0">
          {bidsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredBids.length ? (
            <div className="text-center p-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No {selectedTab === "all" ? "" : selectedTab} bids found.</p>
              {selectedTab !== "all" && (
                <p className="text-gray-500 mt-2">Switch to "All Bids" to see other bids.</p>
              )}
            </div>
          ) : (
            <Card>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredBids.map((bid: any) => {
                    const itemName = getItemName(bid.itemId, bid.itemType);
                    const statusBadge = getBidStatusBadge(bid.status);
                    
                    return (
                      <li key={bid.id} className={bid.status === "rejected" && bid.replacedBy ? "bg-red-50" : ""}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-primary truncate">
                              {itemName} ({bid.itemType})
                            </h3>
                            <div className="ml-2 flex-shrink-0 flex">
                              <Badge variant={statusBadge.variant}>
                                {statusBadge.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <Tag className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                Your bid: ₹{bid.amount}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {bid.deliveryTime || "Not specified"}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p>
                                Bid placed on <time dateTime={bid.createdAt}>{formatDate(bid.createdAt)}</time>
                              </p>
                            </div>
                          </div>
                          
                          {/* Show details for specific statuses */}
                          {bid.status === "accepted" && (
                            <div className="mt-2">
                              <Badge variant="success" className="flex items-center w-fit">
                                <Check className="mr-1 h-3 w-3" />
                                Accepted
                              </Badge>
                            </div>
                          )}
                          
                          {bid.status === "rejected" && bid.replacedBy && (
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center text-sm text-red-600">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Replaced by a lower bid
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReviveBid(bid)}
                                className="text-xs h-8"
                              >
                                Improve Offer
                              </Button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Revive Bid Modal */}
      {selectedBid && (
        <ReviveBidForm
          bidId={selectedBid.id}
          originalBid={selectedBid}
          isOpen={reviveModalOpen}
          onClose={() => setReviveModalOpen(false)}
        />
      )}
    </>
  );
}