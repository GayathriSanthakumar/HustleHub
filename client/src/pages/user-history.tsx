import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Users, Calendar, Package, Briefcase, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function UserHistory() {
  const { user } = useAuth();

  // Load user posted jobs
  const { data: userJobs, isLoading: jobsLoading } = useQuery({
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

  // Filter services accepted (jobs with accepted businesses)
  const acceptedServices = userJobs?.filter((job: any) => 
    job.acceptedBusinessIds && Array.isArray(job.acceptedBusinessIds) && job.acceptedBusinessIds.length > 0
  ) || [];

  // All posted services
  const postedServices = userJobs || [];

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return { label: "Open", variant: "default" as const };
      case "in_progress":
        return { label: "In Progress", variant: "default" as const };
      case "completed":
        return { label: "Completed", variant: "success" as const };
      case "cancelled":
        return { label: "Cancelled", variant: "destructive" as const };
      default:
        return { label: status, variant: "default" as const };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const isLoading = jobsLoading || productsLoading;

  return (
    <DashboardLayout title="History" userType="user">
      <div className="space-y-8">
        {/* Services Accepted Section */}
        <div>
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Services Accepted</h2>
            <Badge variant="outline" className="ml-3">
              {acceptedServices.length}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Jobs you posted where you accepted businesses to work on them
          </p>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : acceptedServices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No services accepted yet.</p>
                <p className="text-gray-500 mt-2">Accept businesses on your posted jobs to see them here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {acceptedServices.map((job: any) => (
                <Card key={job.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate flex-1">{job.title}</h3>
                      <Badge variant={getStatusBadge(job.status).variant} className="ml-2">
                        {getStatusBadge(job.status).label}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                      {job.location}
                    </div>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{job.description}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                      {job.membersNeeded} members needed
                    </div>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                      {job.acceptedBusinessIds?.length || 0} business(es) accepted
                    </div>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                      Posted {formatDate(job.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Services Posted Section */}
        <div>
          <div className="flex items-center mb-4">
            <Briefcase className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Services Posted</h2>
            <Badge variant="outline" className="ml-3">
              {postedServices.length}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            All jobs you have posted
          </p>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : postedServices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">You haven't posted any services yet.</p>
                <p className="text-gray-500 mt-2">Post a job from the Dashboard to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {postedServices.map((job: any) => (
                <Card key={job.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate flex-1">{job.title}</h3>
                      <Badge variant={getStatusBadge(job.status).variant} className="ml-2">
                        {getStatusBadge(job.status).label}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                      {job.location}
                    </div>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{job.description}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                      {job.membersNeeded} members needed
                    </div>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                      Posted {formatDate(job.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Products Requested Section */}
        <div>
          <div className="flex items-center mb-4">
            <Package className="h-6 w-6 text-purple-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Products Requested</h2>
            <Badge variant="outline" className="ml-3">
              {products?.length || 0}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            All product requests you have made
          </p>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !products || products.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">You haven't requested any products yet.</p>
                <p className="text-gray-500 mt-2">Request a product from the Dashboard to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <Card key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <CardContent className="p-6">
                    {product.imagePath && (
                      <div className="mb-4">
                        <img
                          src={product.imagePath}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate flex-1">{product.name}</h3>
                      <Badge variant={getStatusBadge(product.status).variant} className="ml-2">
                        {getStatusBadge(product.status).label}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{product.description}</p>
                    {product.productLink && (
                      <div className="mt-3">
                        <a
                          href={product.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View Product Link →
                        </a>
                      </div>
                    )}
                    {product.lowestBidAmount && (
                      <div className="mt-3 text-sm text-gray-600">
                        Lowest bid: ₹{product.lowestBidAmount}
                      </div>
                    )}
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                      Requested {formatDate(product.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
