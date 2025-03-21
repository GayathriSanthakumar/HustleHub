import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobModal } from "@/components/modals/job-modal";
import { ProductModal } from "@/components/modals/product-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  MapPin, 
  Users, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Check, 
  X, 
  Clock
} from "lucide-react";

export default function UserDashboard() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>("service-accept");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Base path mapping
  const tabPaths = {
    "service-accept": "/user-dashboard",
    "service-post": "/user-dashboard/service-post",
    "product": "/user-dashboard/product"
  };

  // Determine active tab based on current path
  const getInitialTab = () => {
    if (location === "/user-dashboard/service-post") return "service-post";
    if (location === "/user-dashboard/product") return "product";
    return "service-accept";
  };

  // Load jobs
  const { data: availableJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    }
  });

  // Load user posted jobs
  const { data: userJobs, isLoading: userJobsLoading } = useQuery({
    queryKey: ["/api/jobs/user"],
    queryFn: async () => {
      const response = await fetch("/api/jobs/user", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch user jobs");
      return response.json();
    }
  });

  // Load product requests
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products/user"],
    queryFn: async () => {
      const response = await fetch("/api/products/user", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch product requests");
      return response.json();
    }
  });

  // Load bids for specific product
  const { data: productBids, isLoading: bidsLoading } = useQuery({
    queryKey: ["/api/bids/item", selectedProductId, "product"],
    queryFn: async () => {
      if (!selectedProductId) return [];
      const response = await fetch(`/api/bids/item/${selectedProductId}/product`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch bids");
      return response.json();
    },
    enabled: !!selectedProductId
  });

  // Update bid status mutation
  const updateBidMutation = useMutation({
    mutationFn: async ({ bidId, status }: { bidId: number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/bids/${bidId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bids/item", selectedProductId, "product"] });
      toast({
        title: "Bid updated successfully",
        description: "The bid status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update bid",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // End product post mutation
  const endPostMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("PATCH", `/api/products/${productId}/status`, { status: "completed" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/user"] });
      setSelectedProductId(null);
      toast({
        title: "Post ended successfully",
        description: "Your product request has been marked as completed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to end post",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle bid action
  const handleBidAction = (bidId: number, status: "accepted" | "rejected") => {
    updateBidMutation.mutate({ bidId, status });
  };

  // Handle end post
  const handleEndPost = (productId: number) => {
    endPostMutation.mutate(productId);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "success" | "outline" | "destructive", label: string }> = {
      "open": { variant: "success", label: "Open" },
      "in_progress": { variant: "secondary", label: "In Progress" },
      "completed": { variant: "outline", label: "Completed" },
      "cancelled": { variant: "destructive", label: "Cancelled" }
    };
    return statusMap[status] || { variant: "outline", label: status };
  };

  // Get specific product
  const getProduct = (productId: number) => {
    return products?.find(p => p.id === productId);
  };

  return (
    <DashboardLayout title="User Dashboard" userType="user">
      <Tabs 
        defaultValue={getInitialTab()} 
        value={selectedTab} 
        onValueChange={(value) => setSelectedTab(value)}
        className="w-full"
      >
        <TabsList className="w-full max-w-md mb-8">
          <TabsTrigger value="service-accept">Service Accept</TabsTrigger>
          <TabsTrigger value="service-post">Service Post</TabsTrigger>
          <TabsTrigger value="product">Product</TabsTrigger>
        </TabsList>

        {/* Service Accept Tab */}
        <TabsContent value="service-accept" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Services Available</h2>
            <JobModal />
          </div>
          
          {jobsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !availableJobs || availableJobs.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No services available at the moment.</p>
              <p className="text-gray-500 mt-2">Be the first to post a job!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableJobs.map((job) => (
                <Card key={job.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{job.title}</h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                      {job.location}
                    </div>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{job.description}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                      Members needed: {job.membersNeeded}
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Badge variant={getStatusBadge(job.status).variant}>
                        {getStatusBadge(job.status).label}
                      </Badge>
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        View Details <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Service Post Tab */}
        <TabsContent value="service-post" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Posted Jobs</h2>
            <JobModal />
          </div>
          
          {userJobsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !userJobs || userJobs.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">You haven't posted any jobs yet.</p>
              <p className="text-gray-500 mt-2">Click the "Post a Job" button to get started!</p>
            </div>
          ) : (
            <Card>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {userJobs.map((job) => (
                    <li key={job.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-primary truncate">
                            {job.title}
                          </h3>
                          <div className="ml-2 flex-shrink-0 flex">
                            <Badge variant={getStatusBadge(job.status).variant}>
                              {getStatusBadge(job.status).label}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {job.location}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {job.membersNeeded} members needed
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>
                              Posted on <time dateTime={job.createdAt}>{formatDate(job.createdAt)}</time>
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            View Bids <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Product Tab */}
        <TabsContent value="product" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Product Requests</h2>
            <ProductModal />
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">You haven't requested any products yet.</p>
              <p className="text-gray-500 mt-2">Click the "Request Product" button to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
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
                      <Badge variant={getStatusBadge(product.status).variant}>
                        {getStatusBadge(product.status).label}
                      </Badge>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto"
                        onClick={() => setSelectedProductId(product.id)}
                      >
                        View Offers <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Product with Bids */}
          {selectedProductId && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Request Details</h3>
              {bidsLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Card>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {getProduct(selectedProductId)?.name}
                      </h3>
                      <Badge variant="secondary">
                        {productBids?.length || 0} Bids Received
                      </Badge>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {getProduct(selectedProductId)?.description}
                    </p>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:px-6">
                      {(!productBids || productBids.length === 0) ? (
                        <div className="text-center p-8">
                          <p className="text-gray-500">No bids received yet for this product.</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {productBids.map((bid) => (
                              <div key={bid.id} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-gray-900">Business ID: {bid.businessId}</h4>
                                  <span className="text-lg font-bold text-gray-900">₹{bid.amount}</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">{bid.details}</p>
                                <p className="mt-1 text-xs text-gray-500">Delivery: {bid.deliveryTime}</p>
                                <div className="mt-4 flex space-x-2">
                                  {bid.status === "pending" ? (
                                    <>
                                      <Button 
                                        size="sm"
                                        onClick={() => handleBidAction(bid.id, "accepted")}
                                        disabled={updateBidMutation.isPending}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Accept Bid
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleBidAction(bid.id, "rejected")}
                                        disabled={updateBidMutation.isPending}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  ) : (
                                    <Badge variant={bid.status === "accepted" ? "success" : "destructive"}>
                                      {bid.status === "accepted" ? (
                                        <Check className="h-4 w-4 mr-1" />
                                      ) : (
                                        <X className="h-4 w-4 mr-1" />
                                      )}
                                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-6 flex justify-end">
                            <Button 
                              variant="destructive"
                              onClick={() => handleEndPost(selectedProductId)}
                              disabled={endPostMutation.isPending}
                            >
                              {endPostMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              End Post
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
