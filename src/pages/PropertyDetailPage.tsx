import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import axios from "axios";
import {
  MapPin,
  DollarSign,
  Home,
  Bed,
  Bath,
  Square,
  MessageSquare,
} from "lucide-react";
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
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL ;

  const {
    data: property,
    isLoading,
    error,
  } = useQuery<Property>(
    ["property", id],
    async () => {
      console.log(`Fetching property from: ${API_URL}/properties/${id}`); 
      const response = await axios.get(`${API_URL}/properties/${id}`);
      return response.data;
    },
    {
      onError: () => toast.error("Failed to load property details"),
      enabled: !!id,
    }
  );

  const mutation = useMutation(
    async () => {
      if (!property) throw new Error("Property data not loaded");
      const inquiryData = {
        propertyId: id,
        companyId: property.companyId,
        customerPhone: phone,
        message,
      };
      return await axios.post(`${API_URL}/whatsapp`, inquiryData);
    },
    {
      onSuccess: () => {
        toast.success("Inquiry sent successfully!");
        setPhone("");
        setMessage("");
      },
      onError: (error: any) => {
        toast.error(
          `Failed to send inquiry: ${
            error.response?.data?.details || error.message
          }`
        );
      },
    }
  );

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !message) {
      toast.error("Please enter both phone number and message");
      return;
    }
    mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-red-600">
          Error loading property details. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-96">
          <img
            src={
              property.imageUrl ||
              "https://via.placeholder.com/400x300?text=No+Image+Available"
            }
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {property.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <span className="text-lg text-gray-800">
                ${property.price.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <span className="text-lg text-gray-800">{property.location}</span>
            </div>
            {property.details && (
              <>
                <div className="flex items-center space-x-2">
                  <Bed className="h-5 w-5 text-gray-600" />
                  <span className="text-lg text-gray-800">
                    {property.details.bedrooms} Bedrooms
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath className="h-5 w-5 text-gray-600" />
                  <span className="text-lg text-gray-800">
                    {property.details.bathrooms} Bathrooms
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Square className="h-5 w-5 text-gray-600" />
                  <span className="text-lg text-gray-800">
                    {property.details.area}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-gray-600" />
                  <span className="text-lg text-gray-800">
                    {property.details.type}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-700">{property.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Contact Agent via WhatsApp
            </h2>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="+1234567890"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="I'm interested in this property..."
                  required
                />
              </div>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                disabled={mutation.isLoading}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                {mutation.isLoading ? "Sending..." : "Send WhatsApp Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailPage;
