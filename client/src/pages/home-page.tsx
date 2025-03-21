import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, CheckCircle, Clock, Package, Users, ShieldCheck, TrendingUp, Award } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with animated gradient background */}
      <header className="bg-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <div className="flex items-center cursor-pointer">
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-primary text-transparent bg-clip-text text-3xl font-black mr-2">⚡</div>
                    <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-primary text-transparent bg-clip-text">HustleHub</h1>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href={user.userType === "business" ? "/business-dashboard" : "/user-dashboard"}>
                  <Button className="bg-gradient-to-r from-indigo-500 to-primary hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-indigo-500 to-primary hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Login / Register
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with animated elements */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-primary to-blue-500 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBmaWxsPSIjMmE2MGY1IiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NjUiLz48Y2lyY2xlIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgY3g9IjcwMiIgY3k9IjM2MyIgcj0iMTgwIi8+PGNpcmNsZSBzdHJva2U9IiNGRkYiIHN0cm9rZS1vcGFjaXR5PSIuMSIgY3g9IjcwMiIgY3k9IjM2MyIgcj0iMjgwIi8+PGNpcmNsZSBzdHJva2U9IiNGRkYiIHN0cm9rZS1vcGFjaXR5PSIuMSIgY3g9IjcwMiIgY3k9IjM2MyIgcj0iMzgwIi8+PC9nPjwvc3ZnPg==')]" style={{ opacity: '0.3' }}></div>
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%)" }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block mb-2 drop-shadow-md">Connect, Bid, and</span>
                <span className="block text-yellow-300 drop-shadow-md animate-pulse">Get Things Done</span>
              </h1>
              <p className="mt-5 text-base text-white sm:mt-7 sm:text-xl lg:text-lg xl:text-xl drop-shadow-sm">
                HustleHub connects businesses and customers through a simple bidding platform. Post your service needs or request products and get competitive bids from verified businesses.
              </p>
              <div className="mt-10 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 lg:justify-start">
                  <Link href="/auth">
                    <Button size="lg" className="w-full sm:w-auto shadow-xl bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-500 hover:to-yellow-400 text-primary-dark font-bold transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/20 backdrop-blur-sm border border-white/50 text-white hover:bg-white/30 transition-all duration-300 shadow-lg">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-2xl lg:max-w-md transform transition-all hover:scale-105 duration-500">
                <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>
                  <div className="relative px-8 py-16 text-center">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-indigo-500 to-primary text-white shadow-lg mb-6">
                      <div className="text-5xl">⚡</div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">HustleHub Platform</h3>
                    <p className="mt-2 text-gray-600">The easiest way to connect service providers with customers</p>
                    <div className="mt-6 flex justify-center">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        Verified Businesses
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated shapes in the background */}
        <div className="absolute top-1/4 left-4 w-24 h-24 rounded-full bg-yellow-300 opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-indigo-300 opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/3 w-36 h-36 rounded-full bg-primary opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* How it works section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple process for everyone
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Just a few simple steps to connect and get things done.
            </p>
          </div>

          <div className="mt-16">
            <div className="relative">
              {/* Progress line */}
              <div className="hidden absolute top-12 left-1/2 w-0.5 h-full bg-gray-200 lg:block -translate-x-1/2"></div>
              
              <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
                {/* Step 1 */}
                <div className="relative lg:col-start-1">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white shadow-lg z-10">
                      <p className="text-xl font-bold">1</p>
                    </div>
                    <h3 className="mt-6 text-xl leading-7 font-bold text-gray-900">Create an Account</h3>
                    <p className="mt-2 text-base text-gray-600 text-center">
                      Sign up as a user seeking services or as a business offering solutions.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative lg:col-start-2">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white shadow-lg z-10">
                      <p className="text-xl font-bold">2</p>
                    </div>
                    <h3 className="mt-6 text-xl leading-7 font-bold text-gray-900">Post or Bid</h3>
                    <p className="mt-2 text-base text-gray-600 text-center">
                      Users post job listings or product requests. Businesses submit competitive bids.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative lg:col-start-3">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white shadow-lg z-10">
                      <p className="text-xl font-bold">3</p>
                    </div>
                    <h3 className="mt-6 text-xl leading-7 font-bold text-gray-900">Connect & Complete</h3>
                    <p className="mt-2 text-base text-gray-600 text-center">
                      Accept the best offer and get your work done with quality and efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
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
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-50 text-primary mb-5">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">Verified Businesses</h3>
                <p className="text-base text-gray-600">
                  All businesses undergo verification including GST number and location checks to ensure reliability.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-50 text-primary mb-5">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">Competitive Bidding</h3>
                <p className="text-base text-gray-600">
                  Get the best prices and services through our transparent bidding system with quotes in INR.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-50 text-primary mb-5">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">Quality Services</h3>
                <p className="text-base text-gray-600">
                  Compare bids based on price, service details, and delivery time to make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Categories</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Browse popular service categories
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {/* Category cards */}
            {[
              { name: "Home Repair", icon: <Package className="h-6 w-6" /> },
              { name: "Education", icon: <Package className="h-6 w-6" /> },
              { name: "Technology", icon: <Package className="h-6 w-6" /> },
              { name: "Design", icon: <Package className="h-6 w-6" /> },
              { name: "Delivery", icon: <Package className="h-6 w-6" /> },
              { name: "Healthcare", icon: <Package className="h-6 w-6" /> },
              { name: "Beauty", icon: <Package className="h-6 w-6" /> },
              { name: "Appliances", icon: <Package className="h-6 w-6" /> },
              { name: "Catering", icon: <Package className="h-6 w-6" /> },
              { name: "Events", icon: <Package className="h-6 w-6" /> },
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center text-center h-32 transition-all duration-300 hover:shadow-md cursor-pointer">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-50 text-primary mb-3">
                  {category.icon}
                </div>
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What our users say
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-dark font-bold text-xl">
                  R
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Rahul M.</h4>
                  <p className="text-sm text-gray-500">Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "HustleHub made it easy to find new customers. The verification process gave us credibility and the bidding system is transparent."
              </p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-dark font-bold text-xl">
                  P
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Priya S.</h4>
                  <p className="text-sm text-gray-500">Home Owner</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I needed urgent repairs and HustleHub connected me with verified businesses within hours. The bidding system saved me money."
              </p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-dark font-bold text-xl">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Ananya P.</h4>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The quality of services I found through HustleHub exceeded my expectations. Their verification system ensures you get reliable professionals."
              </p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA with gradient background */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-primary"></div>
        <div className="absolute inset-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E')" }}></div>
        
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block drop-shadow-md">Ready to get started?</span>
            <span className="block text-yellow-300 drop-shadow-md">Join HustleHub today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold shadow-xl hover:shadow-2xl transform transition-all hover:-translate-y-1 duration-300">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Company</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-10 flex items-center justify-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-primary text-transparent bg-clip-text text-3xl font-black mr-2">⚡</div>
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-primary text-transparent bg-clip-text">HustleHub</h1>
              </div>
            </Link>
          </div>
          
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {currentYear} HustleHub. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Animation styles added to global CSS */}
    </div>
  );
}
