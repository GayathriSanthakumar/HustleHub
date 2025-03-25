import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Loader2, ImagePlus, TrendingDown, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { insertBidSchema } from "@shared/schema";

const bidFormSchema = insertBidSchema.extend({
  amount: z.coerce.number().min(1, "Bid amount must be at least ₹1"),
  details: z.string().min(10, "Details must be at least 10 characters"),
  deliveryTime: z.string().min(1, "Please select a delivery time"),
});

type BidFormValues = z.infer<typeof bidFormSchema>;

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  itemType: "job" | "product";
  itemName: string;
  itemDescription: string;
}

export function BidModal({ isOpen, onClose, itemId, itemType, itemName, itemDescription }: BidModalProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch existing bids for this item to show the lowest bid
  const { data: itemBids, isLoading: bidsLoading } = useQuery({
    queryKey: [`/api/bids/item/${itemId}/${itemType}`],
    queryFn: async () => {
      const response = await fetch(`/api/bids/item/${itemId}/${itemType}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch bids");
      return response.json();
    },
    enabled: isOpen // Only fetch when modal is open
  });
  
  // Get the lowest bid amount
  const getLowestBidAmount = () => {
    if (!itemBids || itemBids.length === 0) return null;
    const pendingBids = itemBids.filter((bid: any) => bid.status === "pending");
    if (pendingBids.length === 0) return null;
    
    return pendingBids.reduce((min: number, bid: any) => 
      bid.amount < min ? bid.amount : min, 
      pendingBids[0].amount
    );
  };
  
  const lowestBidAmount = getLowestBidAmount();

  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      itemId,
      itemType,
      amount: 0,
      details: "",
      deliveryTime: "",
    },
  });

  const bidMutation = useMutation({
    mutationFn: async (values: BidFormValues) => {
      // If there's an image, upload it first
      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }
        
        const uploadData = await uploadResponse.json();
        values.imagePath = uploadData.path;
        setIsUploading(false);
      }
      
      // Now submit the bid with the image path (if any)
      const response = await apiRequest("POST", "/api/bids", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid placed successfully",
        description: "Your bid has been submitted to the customer",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bids/business"] });
      queryClient.invalidateQueries({ queryKey: [`/api/bids/item/${itemId}/${itemType}`] });
      onClose();
      form.reset({
        itemId,
        itemType,
        amount: 0,
        details: "",
        deliveryTime: "",
      });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to place bid",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: BidFormValues) {
    bidMutation.mutate(values);
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
          <DialogDescription>
            Provide your bid details for this {itemType}
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-900">{itemName}</h4>
          <p className="text-sm text-gray-600 mt-1">{itemDescription}</p>
          
          {bidsLoading ? (
            <div className="flex items-center mt-3 text-sm text-gray-600">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading current bids...
            </div>
          ) : lowestBidAmount ? (
            <Alert className="mt-3 bg-muted/50">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <AlertDescription className="space-y-1">
                <div className="text-sm">Current lowest bid: <span className="font-medium text-green-600">₹{lowestBidAmount}</span></div>
                <div className="text-xs text-gray-600">To win this bid, consider offering a price below ₹{lowestBidAmount}</div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mt-3 bg-blue-50 border-blue-100">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <span className="text-sm">No bids yet - you could be the first!</span>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Bid Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={lowestBidAmount ? `Less than ₹${lowestBidAmount} for competitive bid` : "e.g. 1500"}
                      {...field}
                    />
                  </FormControl>
                  {lowestBidAmount && field.value > 0 && field.value >= lowestBidAmount && (
                    <p className="text-xs text-amber-600 flex items-center mt-1">
                      <Info className="h-3 w-3 mr-1" />
                      Your bid is higher than or equal to the current lowest bid
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the product or service you are offering"
                      rows={4}
                      {...field}
                    />
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
                  <FormLabel>Estimated Delivery Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-2 days">1-2 days</SelectItem>
                      <SelectItem value="3-5 days">3-5 days</SelectItem>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="More than 2 weeks">More than 2 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Image Upload Field */}
            <div className="space-y-2">
              <FormLabel>Product Image (Optional)</FormLabel>
              <FileUpload
                onFileChange={handleFileChange}
                accept="image/*"
                maxSize={5} // 5MB max
                label={selectedFile ? selectedFile.name : "Upload an image of your product"}
                description="Attach a photo of your product to help the customer make a decision"
                value={selectedFile}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={bidMutation.isPending || isUploading}
            >
              {bidMutation.isPending || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading image..." : "Submitting bid..."}
                </>
              ) : (
                "Submit Bid"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
