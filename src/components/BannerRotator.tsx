import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: "homepage" | "listing" | "search";
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
}

interface BannerRotatorProps {
  placement: "homepage" | "listing" | "search";
}

const API_URL = import.meta.env.VITE_API_URL ;


function BannerRotator({ placement }: BannerRotatorProps) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);


  const {
    data: banners = [],
    isLoading,
    error,
  } = useQuery<Banner[]>(
    ["banners", placement],
    async () => {
      const response = await axios.get(
        `${API_URL}/banners?placement=${placement}`
      );
      console.log(`Banners fetched for ${placement}:`, response.data);
      return response.data.filter(
        (banner: any) =>
          new Date(banner.startDate) <= new Date() &&
          new Date(banner.endDate) >= new Date() &&
          banner.status === "active"
      );
    },
    {
      onError: (err) =>
        console.error(`Error fetching banners for ${placement}:`, err),
      staleTime: 60000,
    }
  );

  // Rotate banners automatically
  useEffect(() => {
    if (banners.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [banners.length]); // Dependency on banners.length ensures effect re-runs if banners change

  if (isLoading)
    return <div className="text-center py-4">Loading banners...</div>;
  if (error)
    return (
      <div className="text-center py-4 text-red-500">Error loading banners</div>
    );
  if (banners.length === 0) {
    console.log(`No active banners found for ${placement}`);
    return null;
  }

  const currentBanner = banners[currentBannerIndex];
  console.log(`Displaying banner:`, currentBanner);

  return (
    <div className="banner-container max-w-7xl mx-auto px-4 py-4">
      <a
        href={currentBanner.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
          onError={(e) =>
            console.error(`Failed to load image: ${currentBanner.imageUrl}`)
          }
        />
      </a>
    </div>
  );
}

export default BannerRotator;
