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

  return (
    <DashboardLayout title="Business Dashboard" userType="business">
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
                <Card key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <CardContent className="p-4">
                    {product.imagePath && (
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img 
                          className="object-cover shadow-sm rounded-md" 
                          src={product.imagePath} 
                          alt={product.name} 
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{product.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                      <Button variant="ghost" size="sm" className="flex items-center">
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
                <Card key={request.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <CardContent className="p-4">
                    {request.imagePath && (
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img 
                          className="object-cover shadow-sm rounded-md" 
                          src={request.imagePath} 
                          alt={request.name} 
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900">{request.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{request.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <Badge variant={request.status === "open" ? "success" : "secondary"}>
                        {request.status === "open" ? "Open for Bids" : request.status}
                      </Badge>
                      {request.status === "open" && (
                        <Button 
                          size="sm"
                          onClick={() => handleBidClick(request)}
                          disabled={request.status !== "open"}
                        >
                          Place Bid
                        </Button>
                      )}
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
            <Card>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {activeBids.map((bid) => {
                    // Fetch additional item details if available from the productsWithBids collection
                    // to ensure we only show details of products where this business has placed bids
                    const itemDetails = bid.itemType === "product" ? 
                      productsWithBids?.find(product => product.id === bid.itemId) : 
                      { name: `Item ID: ${bid.itemId}` };

                    return (
                      <li key={bid.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-primary truncate">
                              {itemDetails?.name || `Item ID: ${bid.itemId}`} ({bid.itemType})
                            </h3>
                            <div className="ml-2 flex-shrink-0 flex">
                              <Badge variant={getBidStatusBadge(bid.status).variant}>
                                {getBidStatusBadge(bid.status).label}
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
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                Customer ID: {bid.itemId}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p>
                                Bid placed on <time dateTime={bid.createdAt}>{formatDate(bid.createdAt)}</time>
                              </p>
                            </div>
                          </div>
                          {bid.status === "accepted" && (
                            <div className="mt-2">
                              <Button variant="link" size="sm" className="p-0 h-auto">
                                Customer Details <ArrowRight className="h-4 w-4 ml-1" />
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