import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Schema for bid revival form
const bidRevivalSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  deliveryTime: z.string().min(1, "Delivery time is required"),
});
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobModal } from "@/components/modals/job-modal";
import { ProductModal } from "@/components/modals/product-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Check, 
  X, 
  Clock,
  Edit,
  Phone,
  Mail,
  User,
  Store,
  MapPin,
  Users
} from "lucide-react";

export default function UserDashboard() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>("service-accept");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  // Dialog states
  const [viewJobDetailsOpen, setViewJobDetailsOpen] = useState<boolean>(false);
  const [editJobDetailsOpen, setEditJobDetailsOpen] = useState<boolean>(false);
  const [viewPostDetailsOpen, setViewPostDetailsOpen] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  // Bid revival states
  const [reviveBidId, setReviveBidId] = useState<number | null>(null);
  const [reviveBidDialogOpen, setReviveBidDialogOpen] = useState<boolean>(false);

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
  
  // Load business details for each bid
  const { data: bidBusinesses, isLoading: bidBusinessesLoading } = useQuery({
    queryKey: ["/api/bid-businesses", productBids],
    queryFn: async () => {
      if (!productBids || productBids.length === 0) return {};
      
      // Create an object to store business details by id
      const businessDetails: Record<number, any> = {};
      
      // Fetch details for each unique business ID
      const uniqueBusinessIds = [...new Set(productBids.map((bid: any) => bid.businessId))];
      
      await Promise.all(
        uniqueBusinessIds.map(async (businessId: number) => {
          try {
            const response = await fetch(`/api/users/${businessId}`, {
              credentials: "include"
            });
            if (response.ok) {
              const data = await response.json();
              businessDetails[businessId] = data;
            }
          } catch (error) {
            console.error(`Error fetching business ${businessId} details:`, error);
          }
        })
      );
      
      return businessDetails;
    },
    enabled: !!productBids && productBids.length > 0
  });
  
  // Load bids for specific job
  const { data: jobBids, isLoading: jobBidsLoading } = useQuery({
    queryKey: ["/api/bids/item", selectedJob?.id, "job"],
    queryFn: async () => {
      if (!selectedJob) return [];
      const response = await fetch(`/api/bids/item/${selectedJob.id}/job`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch job bids");
      return response.json();
    },
    enabled: !!selectedJob && viewPostDetailsOpen
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
  
  // Revive bid mutation
  const reviveBidMutation = useMutation({
    mutationFn: async ({ bidId, newAmount, newDeliveryTime }: { bidId: number, newAmount: number, newDeliveryTime: string }) => {
      const response = await apiRequest("POST", `/api/bids/${bidId}/revive`, { 
        amount: newAmount,
        deliveryTime: newDeliveryTime
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bids/item", selectedProductId, "product"] });
      setReviveBidId(null);
      setReviveBidDialogOpen(false);
      toast({
        title: "Bid revived successfully",
        description: "The bid has been reinstated with new terms",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to revive bid",
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
  
  // Update job status mutation
  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/jobs/${jobId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/user"] });
      toast({
        title: "Job status updated",
        description: "The job status has been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update job status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Accept business for job mutation
  const acceptBusinessMutation = useMutation({
    mutationFn: async ({ jobId, businessId }: { jobId: number, businessId: number }) => {
      // Get the current job first to get existing accepted businesses
      const job = await apiRequest("GET", `/api/jobs/${jobId}`).then(res => res.json());
      
      // Add the new business ID to the list if not already present
      const acceptedBusinessIds = Array.isArray(job.acceptedBusinessIds) ? job.acceptedBusinessIds : [];
      if (!acceptedBusinessIds.includes(businessId)) {
        acceptedBusinessIds.push(businessId);
      }
      
      // Update the job with the new list of accepted businesses
      const response = await apiRequest("PATCH", `/api/jobs/${jobId}/accepted-businesses`, { 
        acceptedBusinessIds 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bids/item", selectedJob?.id, "job"] });
      toast({
        title: "Business accepted",
        description: "The business has been accepted for this job",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to accept business",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle bid action
  const handleBidAction = (bidId: number, status: "accepted" | "rejected") => {
    updateBidMutation.mutate({ bidId, status });
  };

  // Handle bid revival initiation
  const handleReviveBid = (bidId: number) => {
    setReviveBidId(bidId);
    setReviveBidDialogOpen(true);
  };

  // Handle bid revival submission
  const handleReviveBidSubmit = (data: { amount: number, deliveryTime: string }) => {
    if (!reviveBidId) return;
    reviveBidMutation.mutate({
      bidId: reviveBidId,
      newAmount: data.amount,
      newDeliveryTime: data.deliveryTime
    });
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
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto"
                        onClick={() => {
                          setSelectedJob(job);
                          setViewJobDetailsOpen(true);
                        }}
                      >
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
                        <div className="mt-2 flex space-x-4">
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto"
                            onClick={() => {
                              setSelectedJob(job);
                              setEditJobDetailsOpen(true);
                            }}
                          >
                            Edit Details <Edit className="h-4 w-4 ml-1" />
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto"
                            onClick={() => {
                              setSelectedJob(job);
                              setViewPostDetailsOpen(true);
                            }}
                          >
                            View Post <ArrowRight className="h-4 w-4 ml-1" />
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
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">
                          {productBids?.length || 0} Bids Received
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEndPost(selectedProductId)}
                          disabled={endPostMutation.isPending}
                        >
                          End Post
                        </Button>
                      </div>
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
                        <div>
                          {/* Bid sections */}
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">Active Bids</h4>
                            {/* Sort bids by amount (lowest first) */}
                            <div className="grid grid-cols-1 gap-4">
                              {productBids
                                .filter(bid => bid.status === "pending")
                                .sort((a, b) => a.amount - b.amount)
                                .map((bid) => {
                                  const business = bidBusinesses?.[bid.businessId];
                                  return (
                                    <div key={bid.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center text-primary mr-3">
                                            <Store className="h-5 w-5" />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                              {business?.businessDetails?.businessName || `Business #${bid.businessId}`}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                              {business?.businessDetails?.shopLocation || "Location not specified"}
                                            </p>
                                          </div>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">₹{bid.amount}</span>
                                      </div>
                                      <div className="mt-3 p-3 bg-white rounded-md border border-gray-100">
                                        <p className="text-sm text-gray-600">{bid.details}</p>
                                        <p className="mt-2 text-xs text-gray-500">Delivery time: {bid.deliveryTime}</p>
                                      </div>
                                      <div className="mt-4 flex space-x-2 justify-end">
                                        <Button 
                                          size="sm"
                                          variant="default"
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => handleBidAction(bid.id, "accepted")}
                                          disabled={updateBidMutation.isPending}
                                        >
                                          <Check className="h-4 w-4 mr-1" />
                                          Accept Quote
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="text-red-600 border-red-600 hover:bg-red-50"
                                          onClick={() => handleBidAction(bid.id, "rejected")}
                                          disabled={updateBidMutation.isPending}
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          Reject Quote
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                          
                          {/* Accepted Bids Section */}
                          {productBids.some(bid => bid.status === "accepted") && (
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-700 mb-4">Accepted Bids</h4>
                              <div className="grid grid-cols-1 gap-4">
                                {productBids
                                  .filter(bid => bid.status === "accepted")
                                  .sort((a, b) => a.amount - b.amount)
                                  .map((bid) => {
                                    const business = bidBusinesses?.[bid.businessId];
                                    return (
                                      <div key={bid.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center text-green-600 mr-3">
                                              <Store className="h-5 w-5" />
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-900">
                                                {business?.businessDetails?.businessName || `Business #${bid.businessId}`}
                                              </h4>
                                              <p className="text-xs text-gray-500">
                                                {business?.businessDetails?.shopLocation || "Location not specified"}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end">
                                            <span className="text-lg font-bold text-gray-900">₹{bid.amount}</span>
                                            <Badge variant="success" className="mt-1">
                                              <Check className="h-3 w-3 mr-1" />
                                              Accepted
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="mt-3 p-3 bg-white rounded-md border border-gray-100">
                                          <p className="text-sm text-gray-600">{bid.details}</p>
                                          <p className="mt-2 text-xs text-gray-500">Delivery time: {bid.deliveryTime}</p>
                                        </div>
                                        <div className="mt-3 p-3 bg-green-100/50 rounded-md border border-green-200">
                                          <h6 className="font-medium text-xs text-gray-900 mb-2">Contact Information</h6>
                                          <div className="space-y-1">
                                            <div className="flex items-center">
                                              <Phone className="h-3 w-3 mr-2 text-gray-500" />
                                              <span className="text-xs">{business?.businessDetails?.shopLocation || "No phone provided"}</span>
                                            </div>
                                            <div className="flex items-center">
                                              <Mail className="h-3 w-3 mr-2 text-gray-500" />
                                              <span className="text-xs">{business?.email || "No email provided"}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                          
                          {/* Rejected Bids Section */}
                          {productBids.some(bid => bid.status === "rejected") && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-4">Rejected Bids</h4>
                              <div className="grid grid-cols-1 gap-4">
                                {productBids
                                  .filter(bid => bid.status === "rejected")
                                  .sort((a, b) => a.amount - b.amount)
                                  .map((bid) => {
                                    const business = bidBusinesses?.[bid.businessId];
                                    return (
                                      <div key={bid.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 opacity-80">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <div className="bg-gray-200 h-10 w-10 rounded-full flex items-center justify-center text-gray-500 mr-3">
                                              <Store className="h-5 w-5" />
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-700">
                                                {business?.businessDetails?.businessName || `Business #${bid.businessId}`}
                                              </h4>
                                              <p className="text-xs text-gray-500">
                                                {business?.businessDetails?.shopLocation || "Location not specified"}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end">
                                            <span className="text-md font-bold text-gray-700">₹{bid.amount}</span>
                                            <Badge variant="destructive" className="mt-1">
                                              <X className="h-3 w-3 mr-1" />
                                              Rejected
                                            </Badge>
                                            {bid.replacedBy && (
                                              <p className="text-xs text-gray-500 mt-1">
                                                Replaced by a better offer
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {bid.imagePath && (
                                          <div className="mt-3 relative aspect-video overflow-hidden rounded-md border border-gray-200">
                                            <img 
                                              src={bid.imagePath} 
                                              alt="Bid product" 
                                              className="object-cover w-full h-full" 
                                            />
                                          </div>
                                        )}
                                        
                                        <div className="mt-3 p-3 bg-white rounded-md border border-gray-100">
                                          <p className="text-sm text-gray-600">{bid.details}</p>
                                          <p className="mt-2 text-xs text-gray-500">Delivery time: {bid.deliveryTime}</p>
                                        </div>
                                        
                                        <div className="mt-3 flex justify-end">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-primary border-primary hover:bg-primary/10"
                                            onClick={() => handleReviveBid(bid.id)}
                                          >
                                            Revive Bid with New Terms
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Post Details Dialog */}
      <Dialog open={viewPostDetailsOpen} onOpenChange={setViewPostDetailsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Job Post Details</DialogTitle>
            <DialogDescription>
              View applicants and their contact information for this job
            </DialogDescription>
          </DialogHeader>
          
          {jobBidsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="p-4 border rounded-lg bg-gray-50 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedJob?.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedJob?.location} (within {selectedJob?.radius || 5}km)</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-sm text-gray-700">Posted on {selectedJob?.createdAt ? formatDate(selectedJob.createdAt) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedJob?.membersNeeded} members needed</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={selectedJob ? getStatusBadge(selectedJob.status).variant : "outline"}>
                      {selectedJob ? getStatusBadge(selectedJob.status).label : "Unknown"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4">{selectedJob?.description}</p>
              </div>
              
              <h4 className="font-medium text-base mb-4">Applicants</h4>
              
              {(!jobBids || jobBids.length === 0) ? (
                <div className="text-center p-6 border rounded-lg bg-gray-50">
                  <p className="text-gray-500">No applicants for this job yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobBids.map((bid) => {
                    const isAccepted = selectedJob?.acceptedBusinessIds?.includes(bid.businessId);
                    
                    return (
                      <div key={bid.id} className={`p-4 rounded-lg border ${isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <User className="h-5 w-5 mr-2 text-gray-500" />
                            <h5 className="font-medium">Business #{bid.businessId}</h5>
                            {isAccepted && (
                              <Badge variant="success" className="ml-2">
                                <Check className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            )}
                          </div>
                          <span className="text-lg font-bold text-gray-900">₹{bid.amount}</span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{bid.details}</p>
                        
                        {/* Contact information - only shown if accepted */}
                        {isAccepted && (
                          <div className="mt-3 p-3 bg-white rounded border border-green-100">
                            <h6 className="font-medium text-sm text-gray-900 mb-2">Contact Information</h6>
                            {bid.contactInfo ? (
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm">{bid.contactInfo.phone || "No phone provided"}</span>
                                </div>
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm">{bid.contactInfo.email || "No email provided"}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No contact information available.</p>
                            )}
                          </div>
                        )}
                        
                        {!isAccepted && bid.status === "pending" && (
                          <div className="mt-3 flex space-x-2">
                            <Button 
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => acceptBusinessMutation.mutate({ 
                                jobId: selectedJob?.id || 0, 
                                businessId: bid.businessId 
                              })}
                              disabled={acceptBusinessMutation.isPending}
                            >
                              {acceptBusinessMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Accept Applicant
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewPostDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Job Details Dialog for services available section */}
      <Dialog open={viewJobDetailsOpen} onOpenChange={setViewJobDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Job Details</DialogTitle>
            <DialogDescription>
              Detailed information about this job posting
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedJob.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedJob.location} (within {selectedJob.radius || 5}km)</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-sm text-gray-700">Posted on {formatDate(selectedJob.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedJob.membersNeeded} members needed</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={getStatusBadge(selectedJob.status).variant}>
                      {getStatusBadge(selectedJob.status).label}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{selectedJob.description}</p>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={() => {
                    // Close this dialog and open the bid modal
                    setViewJobDetailsOpen(false);
                    // If there was a place to bid on jobs, we would redirect there
                    toast({
                      title: "Apply For Job",
                      description: "To apply for this job, please log in as a business account.",
                    });
                  }}
                >
                  Apply for this Job
                </Button>
                <Button variant="outline" onClick={() => setViewJobDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Job Details Dialog */}
      <Dialog open={editJobDetailsOpen} onOpenChange={setEditJobDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Job Details</DialogTitle>
            <DialogDescription>
              Update the information for your job posting
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              {/* Job Details Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="title" className="text-sm font-medium text-gray-900">Title</label>
                  <Input 
                    id="title" 
                    defaultValue={selectedJob.title} 
                    placeholder="Job title"
                    onChange={(e) => {
                      setSelectedJob({
                        ...selectedJob,
                        title: e.target.value
                      });
                    }}
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="location" className="text-sm font-medium text-gray-900">Location</label>
                  <Input 
                    id="location" 
                    defaultValue={selectedJob.location} 
                    placeholder="Job location"
                    onChange={(e) => {
                      setSelectedJob({
                        ...selectedJob,
                        location: e.target.value
                      });
                    }}
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="membersNeeded" className="text-sm font-medium text-gray-900">Members Needed</label>
                  <Input 
                    id="membersNeeded" 
                    type="number" 
                    defaultValue={selectedJob.membersNeeded} 
                    min={1}
                    onChange={(e) => {
                      setSelectedJob({
                        ...selectedJob,
                        membersNeeded: parseInt(e.target.value)
                      });
                    }}
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="radius" className="text-sm font-medium text-gray-900">Location Radius (km)</label>
                  <Input 
                    id="radius" 
                    type="number" 
                    defaultValue={selectedJob.radius || 0} 
                    min={0}
                    onChange={(e) => {
                      setSelectedJob({
                        ...selectedJob,
                        radius: parseInt(e.target.value)
                      });
                    }}
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5 md:col-span-2">
                  <label htmlFor="contactInfo" className="text-sm font-medium text-gray-900">Contact Information</label>
                  <Input 
                    id="contactInfo" 
                    defaultValue={selectedJob.contactInfo} 
                    placeholder="Phone number, email, etc."
                    onChange={(e) => {
                      setSelectedJob({
                        ...selectedJob,
                        contactInfo: e.target.value
                      });
                    }}
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5 md:col-span-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-900">Description</label>
                  <Textarea 
                    id="description" 
                    defaultValue={selectedJob.description} 
                    placeholder="Detailed job description"
                    rows={4}
                    onChange={(e) => {
                      setSelectedJob({
                        ...selectedJob,
                        description: e.target.value
                      });
                    }}
                  />
                </div>
              </div>
              
              {/* Job Status Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Job Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedJob.status === "open" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateJobStatusMutation.mutate({ 
                      jobId: selectedJob.id, 
                      status: "open" 
                    })}
                    disabled={updateJobStatusMutation.isPending}
                  >
                    Open
                  </Button>
                  <Button 
                    variant={selectedJob.status === "in_progress" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateJobStatusMutation.mutate({ 
                      jobId: selectedJob.id, 
                      status: "in_progress" 
                    })}
                    disabled={updateJobStatusMutation.isPending}
                  >
                    In Progress
                  </Button>
                  <Button 
                    variant={selectedJob.status === "completed" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateJobStatusMutation.mutate({ 
                      jobId: selectedJob.id, 
                      status: "completed" 
                    })}
                    disabled={updateJobStatusMutation.isPending}
                  >
                    Completed
                  </Button>
                  <Button 
                    variant={selectedJob.status === "cancelled" ? "destructive" : "outline"} 
                    size="sm"
                    onClick={() => updateJobStatusMutation.mutate({ 
                      jobId: selectedJob.id, 
                      status: "cancelled" 
                    })}
                    disabled={updateJobStatusMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="default" 
              onClick={() => {
                // Handle form submission
                apiRequest("PATCH", `/api/jobs/${selectedJob.id}`, selectedJob)
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/jobs/user"] });
                    toast({
                      title: "Job updated successfully",
                      description: "Your job details have been updated",
                    });
                    setEditJobDetailsOpen(false);
                  })
                  .catch(error => {
                    toast({
                      title: "Failed to update job",
                      description: error.message,
                      variant: "destructive",
                    });
                  });
              }}
            >
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setEditJobDetailsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bid Revival Dialog */}
      <Dialog open={reviveBidDialogOpen} onOpenChange={setReviveBidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Revive Bid with New Terms</DialogTitle>
            <DialogDescription>
              Update your bid with new terms to make it competitive again.
            </DialogDescription>
          </DialogHeader>
          
          {reviveBidMutation.isPending ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReviveBidForm onSubmit={handleReviveBidSubmit} onCancel={() => setReviveBidDialogOpen(false)} />
          )}
        
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// ReviveBidForm Component
interface ReviveBidFormProps {
  onSubmit: (data: { amount: number; deliveryTime: string }) => void;
  onCancel: () => void;
}

function ReviveBidForm({ onSubmit, onCancel }: ReviveBidFormProps) {
  const form = useForm<z.infer<typeof bidRevivalSchema>>({
    resolver: zodResolver(bidRevivalSchema),
    defaultValues: {
      amount: 0,
      deliveryTime: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Amount (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter new amount"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.amount?.message}</FormMessage>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="deliveryTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Delivery Time</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 1 week, 3 days, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.deliveryTime?.message}</FormMessage>
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Submit New Bid
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}