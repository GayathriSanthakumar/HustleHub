import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

type UserType = "user" | "business";

export function ProtectedRoute({
  component: Component,
  userType,
}: {
  component: React.ComponentType;
  userType?: UserType;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If userType is specified, check if user has correct type
  if (userType && user.userType !== userType) {
    // Redirect business users to business dashboard
    if (user.userType === "business") {
      return <Redirect to="/business-dashboard" />;
    }
    // Redirect regular users to user dashboard
    if (user.userType === "user") {
      return <Redirect to="/user-dashboard" />;
    }
  }

  return <Component />;
}
