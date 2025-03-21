import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="text-primary text-3xl mr-2">⚡</div>
                <h1 className="text-xl font-bold text-primary">HustleHub</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href={user.userType === "business" ? "/business-dashboard" : "/user-dashboard"}>
                  <Button variant="default">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button variant="default">Login / Register</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-dark to-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">Connect, Bid, and</span>
                <span className="block text-yellow-300">Get Things Done</span>
              </h1>
              <p className="mt-3 text-base text-white sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                HustleHub connects businesses and customers through a simple bidding platform. Post your service needs or request products and get competitive bids from verified businesses.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 lg:justify-start">
                  <Link href="/auth">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                  <svg
                    className="absolute inset-0 h-full w-full text-gray-200"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 900 600"
                  >
                    <rect width="900" height="600" fill="#F3F4F6" />
                    <path
                      fill="#3B82F6"
                      d="M250 450c83.3-50 166.7-50 250 0s166.7 50 250 0V600H0V450c83.3 50 166.7 50 250 0z"
                    />
                  </svg>
                  <div className="relative px-8 py-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-2xl font-bold text-gray-900">HustleHub Platform</h3>
                    <p className="mt-2 text-gray-600">The easiest way to connect service providers with customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need in one place
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              HustleHub simplifies the process of finding services and requesting products.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">User Accounts</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Choose between user and business accounts, with verification for businesses.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Bidding System</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Businesses can bid on service requests and product needs with quotes in INR.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Complete Workflow</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  From posting needs to accepting bids and completing transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-dark">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-yellow-300">Join HustleHub today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="mt-8 flex justify-center space-x-6">
            {/* Social icons would go here */}
          </div>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2023 HustleHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
