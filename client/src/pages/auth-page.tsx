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
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginType, setLoginType] = useState<"user" | "business">("user");
  const [registrationType, setRegistrationType] = useState<"user" | "business">("user");
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  
  const { user, loginMutation, registerMutation, isLoading } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Registration form
  const registerForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      userType: "user",
      businessName: "",
      gstNumber: "",
      shopLocation: "",
    },
  });

  // Handle login submission
  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
  }

  // Handle registration submission
  function onRegisterSubmit(values: RegistrationFormValues) {
    const userData = {
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      fullName: values.fullName,
      userType: values.userType,
      username: values.email.split('@')[0], // Generate username from email
      status: "pending",
    };

    // Register user first
    registerMutation.mutate(userData);

    // If it's a business account, create business details after successful registration
    // This would be handled in the registration mutation's onSuccess callback in a production app
  }

  // Update form defaults when registration type changes
  useEffect(() => {
    registerForm.setValue("userType", registrationType);
  }, [registrationType, registerForm]);

  // Make sure to redirect AFTER all hooks are called
  if (user) {
    return user.userType === "business" ? <Redirect to="/business-dashboard" /> : <Redirect to="/user-dashboard" />;
  }

  return (
    <AuthLayout>
      <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        {/* Login Tab */}
        <TabsContent value="login">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 text-center bg-white border-b-2 ${
                loginType === "user" ? "border-primary font-medium text-sm text-primary" : "border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setLoginType("user")}
            >
              User Login
            </button>
            <button
              className={`py-2 px-4 text-center bg-white border-b-2 ${
                loginType === "business" ? "border-primary font-medium text-sm text-primary" : "border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setLoginType("business")}
            >
              Business Login
            </button>
          </div>

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
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

              <div className="flex items-center justify-between">
                <FormField
                  control={loginForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="text-sm">
                  <Button variant="link" className="p-0 h-auto">
                    Forgot your password?
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" disabled>
                <FaGoogle className="text-red-500 mr-2" />
                <span>Google</span>
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <FaFacebook className="text-blue-600 mr-2" />
                <span>Facebook</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Register Tab */}
        <TabsContent value="register">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 text-center bg-white border-b-2 ${
                registrationType === "user" ? "border-primary font-medium text-sm text-primary" : "border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setRegistrationType("user")}
            >
              User
            </button>
            <button
              className={`py-2 px-4 text-center bg-white border-b-2 ${
                registrationType === "business" ? "border-primary font-medium text-sm text-primary" : "border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setRegistrationType("business")}
            >
              Business
            </button>
          </div>

          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
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
                      <Input placeholder="you@example.com" {...field} />
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

              {registrationType === "business" && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Business Details</h3>
                  
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

                  <FormField
                    control={registerForm.control}
                    name="verificationProof"
                    render={() => (
                      <FormItem>
                        <FormLabel>Verification Proof</FormLabel>
                        <FormControl>
                          <FileUpload
                            onFileChange={setVerificationFile}
                            accept="image/jpeg, image/png, application/pdf"
                            maxSize={10}
                            label="Upload a verification document"
                            description="PNG, JPG, PDF up to 10MB"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  registrationType === "business" ? "Register Business" : "Sign up"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}
