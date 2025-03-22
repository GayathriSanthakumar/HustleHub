import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { useAuth } from "@/hooks/use-auth";
import { FileUpload } from "@/components/ui/file-upload";
import { Redirect, Link } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";

// Registration form schema
const registrationFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  businessName: z.string().min(2, "Business name is required"),
  gstNumber: z.string().min(2, "GST number is required"),
  shopLocation: z.string().min(2, "Shop location is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export default function BusinessRegisterPage() {
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const { user, registerMutation } = useAuth();

  // Registration form
  const registerForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      businessName: "",
      gstNumber: "",
      shopLocation: "",
    },
  });

  // Handle registration submission
  function onRegisterSubmit(values: RegistrationFormValues) {
    const userData = {
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      fullName: values.fullName,
      userType: "business" as const,
      username: values.email.split('@')[0], // Generate username from email
      status: "verified" as const, // Auto-verify business accounts (simplified verification)
      // Business fields - these will be used to create business details after user creation
      businessName: values.businessName,
      gstNumber: values.gstNumber,
      shopLocation: values.shopLocation,
    };

    // Register business
    registerMutation.mutate(userData);
  }

  // Make sure to redirect AFTER all hooks are called
  if (user) {
    return <Redirect to="/business-dashboard" />;
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/auth">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-auto mr-auto pr-6">Business Registration</h1>
        </div>

        <Form {...registerForm}>
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Account Information</h3>
              <div className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="business@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-4" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Business Details</h3>
              <div className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Business Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your GST Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="shopLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Shop Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Verification Proof (Optional)</FormLabel>
                  <div className="mt-1">
                    <FileUpload
                      onFileChange={setVerificationFile}
                      accept="image/jpeg, image/png, application/pdf"
                      maxSize={10}
                      label="Upload a verification document"
                      description="PNG, JPG, PDF up to 10MB"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Note: All businesses are automatically verified in this version.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering Business...
                </>
              ) : (
                "Register Business"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have a business account?{" "}
            <Link href="/business-login">
              <span className="font-medium text-primary hover:underline cursor-pointer">
                Sign in
              </span>
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}