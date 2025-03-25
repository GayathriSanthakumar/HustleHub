import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, IndianRupee, XCircle, AlertTriangle } from "lucide-react";

// Form schema with validation
const reviveBidSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .min(1, "Amount must be at least ₹1"),
  details: z.string().optional(),
  deliveryTime: z.string().min(1, "Delivery time is required"),
});

type ReviveBidValues = z.infer<typeof reviveBidSchema>;

interface ReviveBidFormProps {
  bidId: number;
  originalBid: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviveBidForm({ 
  bidId, 
  originalBid, 
  isOpen,
  onClose 
}: ReviveBidFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPostCompleted, setIsPostCompleted] = useState(false);

  // Fetch the item's status to check if it's completed
  const { data: itemData, isLoading: itemLoading } = useQuery({
    queryKey: [
      originalBid?.itemType === "product" ? "/api/products" : "/api/jobs", 
      originalBid?.itemId
    ],
    queryFn: async () => {
      if (!originalBid) return null;
      const endpoint = originalBid?.itemType === "product" 
        ? `/api/products/${originalBid.itemId}` 
        : `/api/jobs/${originalBid.itemId}`;
      
      const response = await apiRequest("GET", endpoint);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!originalBid && isOpen
  });

  // Check if the post is completed
  useEffect(() => {
    if (itemData && itemData.status === "completed") {
      setIsPostCompleted(true);
    } else {
      setIsPostCompleted(false);
    }
  }, [itemData]);

  // Initialize form with default values
  const form = useForm<ReviveBidValues>({
    resolver: zodResolver(reviveBidSchema),
    defaultValues: {
      amount: originalBid?.amount || 0,
      details: originalBid?.details || "",
      deliveryTime: originalBid?.deliveryTime || "",
    },
  });

  // Mutation for reviving bid
  const reviveBidMutation = useMutation({
    mutationFn: async (values: ReviveBidValues) => {
      const response = await apiRequest(
        "POST",
        `/api/bids/${bidId}/revive`,
        values
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to revive bid");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid Updated Successfully",
        description: "Your improved offer has been submitted",
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/bids/business"] });
      
      // Close the form
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Bid",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(values: ReviveBidValues) {
    if (isPostCompleted) {
      toast({
        title: "Cannot Update Bid",
        description: "This post has been marked as completed and is no longer accepting bids.",
        variant: "destructive",
      });
      onClose();
      return;
    }
    reviveBidMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {originalBid?.replacedBy ? "Improve Your Bid" : "Submit New Offer"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {originalBid?.replacedBy 
              ? "Your bid was replaced by a lower offer. You can improve your bid to compete." 
              : "Your bid was rejected. You can submit a new offer with better terms."}
          </p>
        </DialogHeader>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={originalBid?.replacedBy ? "destructive" : "secondary"}>
              {originalBid?.replacedBy ? "Replaced Bid" : "Rejected Bid"}
            </Badge>
            <p className="text-sm text-gray-500">#{bidId}</p>
          </div>
          
          <Card className="bg-muted/50 mb-4">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="font-medium">Original Amount: ₹{originalBid?.amount}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm">{originalBid?.deliveryTime}</span>
                </div>
              </div>
              {originalBid?.details && (
                <p className="text-sm text-gray-600 mt-2">{originalBid.details}</p>
              )}
              
              {originalBid?.replacedBy && (
                <div className="mt-4 py-2 px-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>This bid was replaced by a lower bid from another business</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {isPostCompleted ? (
          <div className="mb-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6 flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-medium text-red-700">Post Completed</h3>
                  <p className="text-sm text-red-600 mt-1">
                    This post has been marked as completed and is no longer accepting bids. You cannot update your bid at this time.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end mt-6">
              <Button
                type="button"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        ) : itemLoading ? (
          <div className="flex justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="Enter bid amount"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Time</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 3 days, 1 week"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe why your bid is better"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={reviveBidMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={reviveBidMutation.isPending}
                >
                  {reviveBidMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    originalBid?.replacedBy ? "Submit Improved Bid" : "Submit New Offer"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}