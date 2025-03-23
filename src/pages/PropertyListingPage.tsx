import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, DollarSign } from "lucide-react";
import BannerRotator from "../components/BannerRotator";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  companyId: string;
  tier: "standard" | "featured" | "premium";
  status: "active" | "inactive" | "sold";
  imageUrl?: string;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  contactEmail: string;
  whatsappNumber?: string;
}

function PropertyListingPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [tier, setTier] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      refetchProperties();
    }, 3000);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const {
    data: properties = [],
    isLoading: propertiesLoading,
    refetch: refetchProperties,
  } = useQuery<Property[]>(
    ["properties", companyId, search, tier],
    async () => {
      const queryParams = new URLSearchParams();
      if (companyId) queryParams.append("companyId", companyId);
      if (search) queryParams.append("search", search);
      if (tier) queryParams.append("tier", tier);

      const url = `http://localhost:5001/api/properties${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await axios.get(url);
      return response.data;
    }
  );

  const { data: companies = [], isLoading: companiesLoading } = useQuery<
    Company[]
  >("companies", async () => {
    const response = await axios.get("http://localhost:5001/api/companies");
    return response.data;
  });

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  if (propertiesLoading || companiesLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Available Properties
      </h1>

      <BannerRotator placement="listing" />

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        />
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        >
          <option value="">All Tiers</option>
          <option value="standard">Standard</option>
          <option value="featured">Featured</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.filter((property) => !tier || property.tier === tier)
          .length > 0 ? (
          properties
            .filter((property) => !tier || property.tier === tier)
            .map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handlePropertyClick(property.id)}
              >
                <div className="relative">
                  <img
                    src={
                      property.imageUrl || "https://via.placeholder.com/400x200"
                    }
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  {property.tier === "premium" && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                      Premium
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center text-indigo-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>${property.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <p className="text-gray-500 col-span-full">No properties found</p>
        )}
      </div>
    </div>
  );
}

export default PropertyListingPage;
