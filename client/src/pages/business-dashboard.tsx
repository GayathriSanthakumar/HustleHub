import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BusinessProductModal } from "@/components/modals/business-product-modal";
import { BidModal } from "@/components/modals/bid-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BidStatusNotification } from "@/components/business/bid-status-notification";
import { BidCategories } from "@/components/business/bid-categories";
import { 
  Edit, 
  Search, 
  Loader2, 
  Calendar, 
  Tag, 
  User, 
  ArrowRight, 
  Check,
  Briefcase
} from "lucide-react";

export default function BusinessDashboard() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("products");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [bidModalOpen, setBidModalOpen] = useState<boolean>(false);

  // Base path mapping
  const tabPaths = {
    "products": "/business-dashboard",
    "active-bids": "/business-dashboard/active-bids",
    "user-requests": "/business-dashboard/user-requests"
  };

  // Handle bid submission
  const handleBidSubmit = async (jobId: number, amount: number, details: string) => {
    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: jobId,
          itemType: "job",
          amount,
          details
        }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Failed to submit bid");
      
      toast({
        title: "Bid submitted successfully",
        description: "Your bid has been submitted for review",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/bids/business"] });
    } catch (error) {
      toast({
        title: "Failed to submit bid",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Determine active tab based on current path
  const getInitialTab = () => {
    if (location === "/business-dashboard/user-requests") return "user-requests";
    if (location === "/business-dashboard/active-bids") return "active-bids";
    return "products";
  };

  // Load business products
  const { data: businessProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/business-products/user"],
    queryFn: async () => {
      const response = await fetch("/api/business-products/user", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch business products");
      return response.json();
    }
  });

  // Load all user product requests
  const { data: userRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch product requests");
      return response.json();
    }
  });
  
  // Load only product requests where the business has placed bids
  const { data: productsWithBids, isLoading: productsWithBidsLoading } = useQuery({
    queryKey: ["/api/products/with-bids"],
    queryFn: async () => {
      const response = await fetch("/api/products/with-bids", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch products with bids");
      return response.json();
    }
  });

  // Load active bids
  const { data: activeBids, isLoading: bidsLoading } = useQuery({
    queryKey: ["/api/bids/business"],
    queryFn: async () => {
      const response = await fetch("/api/bids/business", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch active bids");
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

  // Filter user requests based on search query
  const filteredRequests = userRequests ? userRequests.filter(request => 
    request.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    request.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  // Helper function to get the lowest bid for a product
  const getLowestBidForProduct = (productId: number) => {
    if (!activeBids) return null;
    const productBids = activeBids.filter(bid => 
      bid.itemId === productId && 
      bid.itemType === "product" && 
      bid.status === "pending"
    );
    if (productBids.length === 0) return null;
    return productBids.reduce((min, bid) => (bid.amount < min ? bid.amount : min), productBids[0].amount);
  };

  // Open bid modal for a product
  const handleBidClick = (item: any) => {
    setSelectedItem(item);
    setBidModalOpen(true);
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

  // Get user ID from the API
  const { data: userData } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const response = await fetch("/api/user", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      return response.json();
    }
  });

  return (
    <DashboardLayout title="Business Dashboard" userType="business">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Business Dashboard</h1>
        {userData && <BidStatusNotification businessId={userData.id} />}
      </div>
      
      <Tabs 
        defaultValue={getInitialTab()} 
        value={selectedTab} 
        onValueChange={(value) => setSelectedTab(value)}
        className="w-full"
      >
        <TabsList className="w-full max-w-md mb-8">
          <TabsTrigger value="products">Your Products</TabsTrigger>
          <TabsTrigger value="user-requests">User Requests</TabsTrigger>
          <TabsTrigger value="active-bids">Active Bids</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
            <BusinessProductModal />
          </div>

          {productsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !businessProducts || businessProducts.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">You haven't added any products yet.</p>
              <p className="text-gray-500 mt-2">Click the "Add Product" button to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {businessProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className={`bg-white overflow-hidden shadow rounded-lg ${
                    product.status === "completed" ? "bg-gray-50 border-2 border-gray-200" : ""
                  }`}
                >
                  {product.status === "completed" && (
                    <div className="bg-gray-200 text-gray-600 text-center py-1 text-xs font-medium">
                      COMPLETED
                    </div>
                  )}
                  <CardContent className="p-4">
                    {product.imagePath && (
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img 
                          className={`object-cover shadow-sm rounded-md ${
                            product.status === "completed" ? "opacity-75" : ""
                          }`} 
                          src={product.imagePath} 
                          alt={product.name} 
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{product.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                        {product.status !== "open" && (
                          <Badge variant={product.status === "completed" ? "outline" : "default"}>
                            {product.status === "completed" ? "Completed" : 
                             product.status === "in_progress" ? "In Progress" : 
                             product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center"
                        disabled={product.status === "completed"}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* User Requests Tab */}
        <TabsContent value="user-requests" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Product Requests</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search requests..." 
                className="w-64 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {requestsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredRequests || filteredRequests.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No product requests found.</p>
              {searchQuery && <p className="text-gray-500 mt-2">Try a different search term.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className={`bg-white overflow-hidden shadow rounded-lg ${
                    request.status === "completed" ? "bg-gray-50 border-2 border-gray-200" : ""
                  }`}
                >
                  {request.status === "completed" && (
                    <div className="bg-gray-200 text-gray-600 text-center py-1 text-xs font-medium">
                      COMPLETED
                    </div>
                  )}
                  <CardContent className="p-4">
                    {request.imagePath && (
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img 
                          className={`object-cover shadow-sm rounded-md ${
                            request.status === "completed" ? "opacity-75" : ""
                          }`}
                          src={request.imagePath} 
                          alt={request.name} 
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900">{request.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{request.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex flex-col gap-2">
                        <Badge variant={
                          request.status === "open" ? "success" : 
                          request.status === "completed" ? "outline" : 
                          "secondary"
                        }>
                          {
                            request.status === "open" ? "Open for Bids" : 
                            request.status === "in_progress" ? "In Progress" :
                            request.status === "completed" ? "Completed" :
                            request.status
                          }
                        </Badge>
                        {request.status === "open" && (
                          <div className="text-xs font-medium text-gray-500">
                            {getLowestBidForProduct(request.id) ? (
                              <span className="text-green-600">Current lowest: ₹{getLowestBidForProduct(request.id)}</span>
                            ) : (
                              <span>No bids yet</span>
                            )}
                          </div>
                        )}
                      </div>
                      {(request.status === "open" || request.status === "in_progress") ? (
                        <Button 
                          size="sm"
                          onClick={() => handleBidClick(request)}
                        >
                          Place Bid
                        </Button>
                      ) : request.status === "completed" ? (
                        <div className="flex items-center text-gray-500 text-sm">
                          <Badge variant="outline" className="text-gray-500">
                            Bidding Closed
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active Bids Tab */}
        <TabsContent value="active-bids" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Active Bids</h2>
          </div>
          
          {/* Import the BidCategories component to handle different bid categories */}
          <div className="w-full">
            {bidsLoading || productsWithBidsLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !activeBids || activeBids.length === 0 ? (
              <div className="text-center p-12 border rounded-lg bg-gray-50">
                <p className="text-gray-500">You haven't placed any bids yet.</p>
                <p className="text-gray-500 mt-2">Check the "User Requests" tab to find opportunities!</p>
              </div>
            ) : (
              // Use the BidCategories component
              <div className="w-full">
                <BidCategories />
              </div>
            )}
          </div>
        </TabsContent>


      </Tabs>

      {/* Bid Modal */}
      {selectedItem && (
        <BidModal 
          isOpen={bidModalOpen} 
          onClose={() => setBidModalOpen(false)}
          itemId={selectedItem.id}
          itemType="product"
          itemName={selectedItem.name}
          itemDescription={selectedItem.description}
        />
      )}
    </DashboardLayout>
  );
}