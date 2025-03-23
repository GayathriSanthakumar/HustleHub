import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobModal } from "@/components/modals/job-modal";
import { ProductModal } from "@/components/modals/product-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Tag, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UserDashboard() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("browse-jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobModalOpen, setJobModalOpen] = useState(false); // Added state for job modal

  // Base path mapping
  const tabPaths = {
    "browse-jobs": "/user-dashboard",
    "request-job": "/user-dashboard/request-job",
    "request-product": "/user-dashboard/request-product"
  };

  // Determine active tab based on current path
  const getInitialTab = () => {
    if (location === "/user-dashboard/request-job") return "request-job";
    if (location === "/user-dashboard/request-product") return "request-product";
    return "browse-jobs";
  };

  // Load jobs
  const { data: availableJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    }
  });

  // Load user's job requests
  const { data: userJobs, isLoading: userJobsLoading } = useQuery({
    queryKey: ["/api/jobs/user"],
    queryFn: async () => {
      const response = await fetch("/api/jobs/user", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch user jobs");
      return response.json();
    }
  });

  // Load user's product requests and their bids
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products/user"],
    queryFn: async () => {
      const response = await fetch("/api/products/user", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch product requests");
      return response.json();
    }
  });

  const handleAcceptReject = async (itemId: number, itemType: string, action: "accept" | "reject") => {
    try {
      const response = await fetch(`/api/${itemType}s/${itemId}/${action}`, {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) throw new Error(`Failed to ${action} ${itemType}`);

      toast({
        title: `${itemType} ${action}ed successfully`,
        description: `The ${itemType} has been ${action}ed`,
      });
    } catch (error) {
      toast({
        title: `Failed to ${action} ${itemType}`,
        description: error.message,
        variant: "destructive",
      });
    }
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
          <TabsTrigger value="browse-jobs">Browse Jobs</TabsTrigger>
          <TabsTrigger value="request-job">Request Job</TabsTrigger>
          <TabsTrigger value="request-product">Request Product</TabsTrigger>
        </TabsList>

        {/* Browse Jobs Tab */}
        <TabsContent value="browse-jobs" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Browse Jobs</h2>
            <Input
              placeholder="Search jobs..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {availableJobs?.map((job) => (
              <Card key={job.id} className="bg-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.companyName}</p>
                    </div>
                    <Badge>{job.jobType}</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">{job.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Request Job Tab */}
        <TabsContent value="request-job" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Job Requests</h2>
            <Button onClick={() => setJobModalOpen(true)}>
              Post a Job
            </Button>
          </div>
          <JobModal open={jobModalOpen} onOpenChange={setJobModalOpen} />

          <div className="grid grid-cols-1 gap-4">
            {userJobs?.map((job) => (
              <Card key={job.id} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                    </div>
                    {job.applicantIds?.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="bg-red-50"
                          onClick={() => handleAcceptReject(job.id, 'job', 'reject')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-green-50"
                          onClick={() => handleAcceptReject(job.id, 'job', 'accept')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Request Product Tab */}
        <TabsContent value="request-product" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Product Requests</h2>
            <ProductModal />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {products?.map((product) => (
              <Card key={product.id} className="bg-white">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                      </div>
                    </div>

                    {product.bids?.map((bid) => (
                      <div key={bid.id} className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Bid Amount: ₹{bid.amount}</p>
                            <p className="text-sm text-gray-600">{bid.details}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="bg-red-50"
                              onClick={() => handleAcceptReject(bid.id, 'bid', 'reject')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-green-50"
                              onClick={() => handleAcceptReject(bid.id, 'bid', 'accept')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}