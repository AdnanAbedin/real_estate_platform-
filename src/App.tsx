import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PropertyListingPage from "./pages/PropertyListingPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

interface Banner {
  id?: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: "homepage" | "listing" | "search";
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
}

function App() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/banners") // Updated port to 5001
      .then((res) => res.json())
      .then((data) => setBanners(data))
      .catch((err) => console.error("Failed to fetch banners:", err));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          {banners.length > 0 && (
            <div className="banner-container max-w-7xl mx-auto px-4 py-4">
              <img
                src={banners[0].imageUrl}
                alt={banners[0].title}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
          <Routes>
            <Route path="/" element={<HomePage banners={banners} />} />
            <Route path="/properties" element={<PropertyListingPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;