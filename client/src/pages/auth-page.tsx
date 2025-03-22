import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { useAuth } from "@/hooks/use-auth";
import { FileUpload } from "@/components/ui/file-upload";
import { Redirect, Link } from "wouter";
import { Loader2, User, Building, ArrowRight } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";

// Login form schema
const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// Registration form schema
const registrationFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  userType: z.enum(["user", "business"]),
  // Business-specific fields
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  shopLocation: z.string().optional(),
  verificationProof: z.instanceof(File).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine(
  (data) => {
    // If userType is business, business fields are required
    if (data.userType === "business") {
      return !!data.businessName && !!data.gstNumber && !!data.shopLocation;
    }
    return true;
  },
  {
    message: "Business details are required",
    path: ["businessName"],
  }
);

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export default function AuthPage() {
  const { user } = useAuth();

  // Make sure to redirect AFTER all hooks are called
  if (user) {
    return user.userType === "business" ? <Redirect to="/business-dashboard" /> : <Redirect to="/user-dashboard" />;
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-center mb-8 text-primary">Welcome to HustleHub</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center bg-primary-50 w-16 h-16 rounded-full mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2">I am a User</h2>
              <p className="text-gray-600 text-center mb-6">Looking for services or selling products</p>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/user-login">
                  <Button className="w-full" variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/user-register">
                  <Button className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center bg-primary-50 w-16 h-16 rounded-full mx-auto mb-4">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2">I am a Business</h2>
              <p className="text-gray-600 text-center mb-6">Offering services or products</p>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/business-login">
                  <Button className="w-full" variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/business-register">
                  <Button className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Already have an account? <Link href="/login"><span className="text-primary hover:underline cursor-pointer">Login here</span></Link></p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
