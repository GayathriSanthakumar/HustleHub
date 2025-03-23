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
  const [selectedTab, setSelectedTab] = useState<string>("posted-jobs"); // Updated default tab
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [bidModalOpen, setBidModalOpen] = useState<boolean>(false);

  // Base path mapping
  const tabPaths = {
    "posted-jobs": "/business-dashboard",
    "applications": "/business-dashboard/applications",
    "active-bids": "/business-dashboard/active-bids",
    "user-requests": "/business-dashboard/user-requests"
  };

  // Load available jobs
  const { data: availableJobs, isLoading: availableJobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    }
  });

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
    if (location === "/business-dashboard/applications") return "applications";
    if (location === "/business-dashboard/active-bids") return "active-bids";
    return "posted-jobs"; // Default to "posted-jobs"
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

  // Load user product requests
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

  // Placeholder for job data (replace with actual API call)
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs/business"],
    queryFn: async () => {
      const response = await fetch("/api/jobs/business", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch jobs");
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
          <TabsTrigger value="product-requests">Product Requests</TabsTrigger>
          <TabsTrigger value="active-bids">Active Bids</TabsTrigger>
        </TabsList>

        {/* Product Requests Tab */}
        <TabsContent value="product-requests" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Product Requests</h2>
          </div>
          {/* Product requests display */}
          <div className="grid grid-cols-1 gap-4">
            {products?.map((product) => (
              <Card key={product.id} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    </div>
                    <Button onClick={() => {
                      setSelectedItem(product);
                      setBidModalOpen(true);
                    }}>
                      Place Bid
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {jobsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">You haven't posted any jobs yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Card key={job.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{job.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active Bids Tab */}
        <TabsContent value="active-bids" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Active Bids</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {activeBids?.map((bid) => (
              <Card key={bid.id} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {bid.itemType === 'product' ? 'Product Request' : 'Job Request'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Bid Amount: ₹{bid.amount}</p>
                      <p className="text-sm text-gray-600">{bid.details}</p>
                    </div>
                    <Badge variant={bid.status === 'accepted' ? 'success' : bid.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Bids Tab */}
        <TabsContent value="active-bids" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Active Bids</h2>
          </div>

          {bidsLoading ? (
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
                  {activeBids.map((bid) => (
                    <li key={bid.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-primary truncate">
                            Item ID: {bid.itemId} ({bid.itemType})
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
                  ))}
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