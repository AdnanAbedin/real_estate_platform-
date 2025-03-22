import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, UseMutationResult } from "react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import PropertyForm from "../components/PropertyForm";


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

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined); // Changed from null to undefined
  const [newCompany, setNewCompany] = useState({
    name: "",
    description: "",
    logo: "",
    contactEmail: "",
    whatsappNumber: "",
  });

  // Fetch companies
  const { data: companies = [] } = useQuery<Company[]>("companies", async () => {
    const response = await axios.get("http://localhost:5001/api/companies");
    return response.data;
  });

  // Fetch properties
  const { data: properties = [], isLoading, error } = useQuery<Property[]>(
    ["properties", selectedCompanyId],
    async () => {
      const url = selectedCompanyId
        ? `http://localhost:5001/api/properties?companyId=${selectedCompanyId}`
        : "http://localhost:5001/api/properties";
      const response = await axios.get(url);
      return response.data;
    },
    {
      onError: () => toast.error("Failed to load properties"),
    }
  );

  // Create company mutation
  const createCompany: UseMutationResult<Company, unknown, Omit<Company, "id">> = useMutation(
    async (company: Omit<Company, "id">) => {
      const response = await axios.post("http://localhost:5001/api/companies", company);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("companies");
        toast.success("Company created successfully");
        setShowCompanyForm(false);
        setNewCompany({ name: "", description: "", logo: "", contactEmail: "", whatsappNumber: "" });
      },
      onError: (error: unknown) => {
        toast.error(`Failed to create company: ${String(error)}`);
      },
    }
  );

  // Delete property mutation
  const deleteProperty: UseMutationResult<void, unknown, string> = useMutation(
    async (id: string) => {
      await axios.delete(`http://localhost:5001/api/properties/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("properties");
        toast.success("Property deleted successfully");
      },
      onError: (error: unknown) => {
        toast.error(`Failed to delete property: ${String(error)}`);
      },
    }
  );

  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompany.mutate(newCompany);
  };

  const handlePropertyClose = () => {
    setShowPropertyForm(false);
    setEditingProperty(undefined); // Changed from null to undefined
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error loading properties</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Company Creation */}
      <button
        onClick={() => setShowCompanyForm(!showCompanyForm)}
        className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded flex items-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        {showCompanyForm ? "Cancel" : "Add Company"}
      </button>

      {showCompanyForm && (
        <form onSubmit={handleCompanySubmit} className="mb-8 p-4 bg-white rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Company Name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={newCompany.contactEmail}
              onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Logo URL (optional)"
              value={newCompany.logo}
              onChange={(e) => setNewCompany({ ...newCompany, logo: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="WhatsApp Number (optional)"
              value={newCompany.whatsappNumber}
              onChange={(e) => setNewCompany({ ...newCompany, whatsappNumber: e.target.value })}
              className="p-2 border rounded"
            />
          </div>
          <textarea
            placeholder="Description (optional)"
            value={newCompany.description}
            onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
            className="mt-4 p-2 border rounded w-full"
          />
          <button
            type="submit"
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            disabled={createCompany.isLoading}
          >
            {createCompany.isLoading ? "Creating..." : "Create Company"}
          </button>
        </form>
      )}

      {/* Property Filters */}
      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full max-w-md"
        />
        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Property Button */}
      <button
        onClick={() => setShowPropertyForm(true)}
        className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded flex items-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Property
      </button>

      {/* Property Form */}
      {(showPropertyForm || editingProperty) && (
        <PropertyForm property={editingProperty} onClose={handlePropertyClose} />
      )}

      {/* Property List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <tr key={property.id}>
                  <td className="px-6 py-4">{property.title}</td>
                  <td className="px-6 py-4">{property.location}</td>
                  <td className="px-6 py-4">${property.price.toLocaleString()}</td>
                  <td className="px-6 py-4">{property.tier}</td>
                  <td className="px-6 py-4">{property.status}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setEditingProperty(property)}
                      className="text-indigo-600 mr-4"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteProperty.mutate(property.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No properties found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;