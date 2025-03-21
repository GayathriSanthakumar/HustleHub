import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Briefcase,
  Home,
  LogOut,
  Menu,
  Package,
  User,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userType: "user" | "business";
}

export function DashboardLayout({ children, title, userType }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Define navigation items based on user type
  const userNavItems = [
    {
      title: "Service Accept",
      href: "/user-dashboard",
      icon: <Package className="h-5 w-5 mr-2" />,
      active: location === "/user-dashboard",
    },
    {
      title: "Service Post",
      href: "/user-dashboard/service-post",
      icon: <Briefcase className="h-5 w-5 mr-2" />,
      active: location === "/user-dashboard/service-post",
    },
    {
      title: "Product",
      href: "/user-dashboard/product",
      icon: <Package className="h-5 w-5 mr-2" />,
      active: location === "/user-dashboard/product",
    },
  ];

  const businessNavItems = [
    {
      title: "Your Products",
      href: "/business-dashboard",
      icon: <Package className="h-5 w-5 mr-2" />,
      active: location === "/business-dashboard",
    },
    {
      title: "User Requests",
      href: "/business-dashboard/user-requests",
      icon: <User className="h-5 w-5 mr-2" />,
      active: location === "/business-dashboard/user-requests",
    },
    {
      title: "Active Bids",
      href: "/business-dashboard/active-bids",
      icon: <Briefcase className="h-5 w-5 mr-2" />,
      active: location === "/business-dashboard/active-bids",
    },
  ];

  const navItems = userType === "user" ? userNavItems : businessNavItems;

  function handleLogout() {
    logoutMutation.mutate();
  }

  function getStatusIcon() {
    if (!user) return null;
    
    if (user.status === "verified") {
      return <CheckCircle className="h-4 w-4 text-green-500 mr-1" />;
    } else if (user.status === "pending") {
      return <Clock className="h-4 w-4 text-yellow-500 mr-1" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500 mr-1" />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <div className="flex items-center cursor-pointer">
                    <div className="text-primary text-3xl mr-2">⚡</div>
                    <h1 className="text-xl font-bold text-primary">HustleHub</h1>
                  </div>
                </Link>
              </div>
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`${
                        item.active
                          ? "border-primary text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}
                    >
                      {item.title}
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              {user && user.userType === "business" && (
                <Badge variant={user.status === "verified" ? "success" : "outline"} className="mr-4">
                  <span className="flex items-center">
                    {getStatusIcon()}
                    {user.status === "verified" ? "Verified" : "Pending"}
                  </span>
                </Badge>
              )}
              <div className="hidden md:ml-4 md:flex md:items-center">
                <div className="relative">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarFallback>
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {user?.username || "User"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="ml-2"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-primary text-2xl mr-2">⚡</div>
                        <h2 className="text-lg font-bold text-primary">HustleHub</h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileNavOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex flex-col space-y-2 mt-4">
                      {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={`${
                              item.active
                                ? "bg-primary/10 text-primary"
                                : "text-gray-600 hover:bg-gray-100"
                            } flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer`}
                            onClick={() => setIsMobileNavOpen(false)}
                          >
                            {item.icon}
                            {item.title}
                          </div>
                        </Link>
                      ))}
                      <Link href="/">
                        <div className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer" onClick={() => setIsMobileNavOpen(false)}>
                          <Home className="h-5 w-5 mr-2" />
                          Home
                        </div>
                      </Link>
                      <button
                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                        onClick={() => {
                          setIsMobileNavOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Avatar>
                            <AvatarFallback>
                              {user?.username?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user?.username || "User"}</p>
                            <p className="text-xs text-gray-500">{user?.email || ""}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
