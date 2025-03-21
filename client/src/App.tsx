import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import UserDashboard from "@/pages/user-dashboard";
import BusinessDashboard from "@/pages/business-dashboard";
import HomePage from "@/pages/home-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public route */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes - User dashboard */}
      <Route path="/user-dashboard">
        <ProtectedRoute userType="user" component={UserDashboard} />
      </Route>
      
      {/* Protected routes - Business dashboard */}
      <Route path="/business-dashboard">
        <ProtectedRoute userType="business" component={BusinessDashboard} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
