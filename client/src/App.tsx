import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import UserLoginPage from "@/pages/user-login";
import UserRegisterPage from "@/pages/user-register";
import BusinessLoginPage from "@/pages/business-login";
import BusinessRegisterPage from "@/pages/business-register";
import UserDashboard from "@/pages/user-dashboard";
import BusinessDashboard from "@/pages/business-dashboard";
import HomePage from "@/pages/home-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ChatDrawer } from "@/components/chat";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/user-login" component={UserLoginPage} />
      <Route path="/user-register" component={UserRegisterPage} />
      <Route path="/business-login" component={BusinessLoginPage} />
      <Route path="/business-register" component={BusinessRegisterPage} />
      
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
        <ChatDrawer />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
