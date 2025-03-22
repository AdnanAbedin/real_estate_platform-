// src/pages/HomePage.tsx
import React from "react";
import { Building2, MapPin, DollarSign } from "lucide-react";
import BannerRotator from "../components/BannerRotator";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-indigo-600 h-[500px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1973&q=80"
            alt="Modern building"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Dream Home
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            Discover the perfect property from our extensive collection of
            premium real estate listings.
          </p>
        </div>
      </div>

      {/* Banner Section */}
      <BannerRotator placement="homepage" />

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-6">
              <Building2 className="h-12 w-12 text-indigo-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Premium Properties
              </h3>
              <p className="mt-2 text-base text-gray-500 text-center">
                Access exclusive listings from top real estate companies.
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <MapPin className="h-12 w-12 text-indigo-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Prime Locations
              </h3>
              <p className="mt-2 text-base text-gray-500 text-center">
                Find properties in the most desirable neighborhoods.
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <DollarSign className="h-12 w-12 text-indigo-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Best Value
              </h3>
              <p className="mt-2 text-base text-gray-500 text-center">
                Get the best deals on your dream property.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;