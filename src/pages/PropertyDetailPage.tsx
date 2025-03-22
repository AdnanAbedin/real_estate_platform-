import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { MapPin, DollarSign, Home, Bed, Bath, Square } from "lucide-react";
import toast from "react-hot-toast";

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
  details?: {
    bedrooms: number;
    bathrooms: number;
    area: string;
    type: string;
  };
}

function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: property, isLoading, error } = useQuery<Property>(
    ["property", id],
    async () => {
      const response = await axios.get(`http://localhost:5001/api/properties/${id}`);
      return response.data;
    },
    {
      onError: () => toast.error("Failed to load property details"),
    }
  );

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error || !property) return <div className="p-4 text-red-600">Error loading property</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-96">
          <img
            src={property.imageUrl || "https://via.placeholder.com/400x300"}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>

          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{property.location}</span>
          </div>

          <div className="flex items-center text-indigo-600 text-2xl font-bold mb-6">
            <DollarSign className="h-6 w-6 mr-2" />
            <span>${property.price.toLocaleString()}</span>
          </div>

          {property.details && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Home className="h-5 w-5 text-indigo-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium">{property.details.type}</div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Bed className="h-5 w-5 text-indigo-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Bedrooms</div>
                  <div className="font-medium">{property.details.bedrooms}</div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Bath className="h-5 w-5 text-indigo-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Bathrooms</div>
                  <div className="font-medium">{property.details.bathrooms}</div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Square className="h-5 w-5 text-indigo-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Area</div>
                  <div className="font-medium">{property.details.area}</div>
                </div>
              </div>
            </div>
          )}

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600">{property.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailPage;