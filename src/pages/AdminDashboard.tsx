import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Edit,
  Layout,
  Home,
  Tag,
  Users,
  Bell,
} from "lucide-react";
import PropertyForm from "../components/PropertyForm";
import BannerForm from "../components/BannerForm";
import AgentProfile from "../components/AgentProfile";

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

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, properties, companies, banners
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(
    undefined
  );
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>(
    undefined
  );
  const [newCompany, setNewCompany] = useState<{
    id?: string;
    name: string;
    description: string;
    logo: string;
    contactEmail: string;
    whatsappNumber: string;
  }>({
    id: undefined,
    name: "",
    description: "",
    logo: "",
    contactEmail: "",
    whatsappNumber: "",
  });

  const { data: companies = [] } = useQuery<Company[]>(
    "companies",
    async () => {
      const response = await axios.get("http://localhost:5001/api/companies");
      return response.data;
    }
  );

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<
    Property[]
  >(["properties", selectedCompanyId], async () => {
    const url = selectedCompanyId
      ? `http://localhost:5001/api/properties?companyId=${selectedCompanyId}`
      : "http://localhost:5001/api/properties";
    const response = await axios.get(url);
    return response.data;
  });

  const { data: banners = [], isLoading: bannersLoading } = useQuery<Banner[]>(
    "banners",
    async () => {
      const response = await axios.get("http://localhost:5001/api/banners");
      return response.data;
    }
  );

  const createCompany = useMutation<Company, Error, Omit<Company, "id">>(
    async (company: Omit<Company, "id">) => {
      const response = await axios.post(
        "http://localhost:5001/api/companies",
        company
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("companies");
        toast.success("Company created successfully");
        setShowCompanyForm(false);
        setNewCompany({
          name: "",
          description: "",
          logo: "",
          contactEmail: "",
          whatsappNumber: "",
        });
      },
      onError: (error: Error) => {
        toast.error(`Failed to create company: ${error.message}`);
      },
    }
  );

  const updateCompany = useMutation<Company, Error, Company>(
    async (company: Company) => {
      const response = await axios.put(
        `http://localhost:5001/api/companies/${company.id}`,
        company
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("companies");
        toast.success("Company updated successfully");
        setShowCompanyForm(false);
        setNewCompany({
          name: "",
          description: "",
          logo: "",
          contactEmail: "",
          whatsappNumber: "",
        });
      },
      onError: (error: Error) => {
        toast.error(`Failed to update company: ${error.message}`);
      },
    }
  );

  const deleteProperty = useMutation<void, Error, string>(
    async (id: string) => {
      await axios.delete(`http://localhost:5001/api/properties/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("properties");
        toast.success("Property deleted successfully");
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete property: ${error.message}`);
      },
    }
  );

  const deleteBanner = useMutation<void, Error, string>(
    async (id: string) => {
      await axios.delete(`http://localhost:5001/api/banners/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("banners");
        toast.success("Banner deleted successfully");
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete banner: ${error.message}`);
      },
    }
  );

  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCompany.id) {
      updateCompany.mutate(newCompany as Company);
    } else {
      createCompany.mutate(newCompany);
    }
  };

  const handleEditCompany = (company: Company) => {
    setNewCompany({
      id: company.id,
      name: company.name,
      description: company.description || "",
      logo: company.logo || "",
      contactEmail: company.contactEmail,
      whatsappNumber: company.whatsappNumber || "",
    });
    setShowCompanyForm(true);
  };

  const handlePropertyClose = () => {
    setShowPropertyForm(false);
    setEditingProperty(undefined);
  };

  const handleBannerClose = () => {
    setShowBannerForm(false);
    setEditingBanner(undefined);
  };

  if (propertiesLoading || bannersLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse"></div>
            <div className="text-lg font-medium text-gray-700">
              Loading data...
            </div>
          </div>
        </div>
      </div>
    );

  const renderDashboard = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Home className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Companies</p>
                <p className="text-2xl font-bold">{companies.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Active Banners</p>
                <p className="text-2xl font-bold">
                  {banners.filter((b) => b.status === "active").length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Tag className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Agent Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {companies.map((company) => (
          <AgentProfile key={company.id} companyId={company.id} />
        ))}
      </div>
    </>
  );

  const renderCompanies = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Companies</h2>
        <button
          onClick={() => {
            setNewCompany({
              id: undefined,
              name: "",
              description: "",
              logo: "",
              contactEmail: "",
              whatsappNumber: "",
            });
            setShowCompanyForm(!showCompanyForm);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          {showCompanyForm ? "Cancel" : "Add Company"}
        </button>
      </div>

      {showCompanyForm && (
        <form
          onSubmit={handleCompanySubmit}
          className="mb-8 p-6 bg-white rounded-lg shadow-md"
        >
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">
            {newCompany.id ? "Edit Company" : "New Company"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Company Name"
              value={newCompany.name}
              onChange={(e) =>
                setNewCompany({ ...newCompany, name: e.target.value })
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={newCompany.contactEmail}
              onChange={(e) =>
                setNewCompany({ ...newCompany, contactEmail: e.target.value })
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Logo URL (optional)"
              value={newCompany.logo}
              onChange={(e) =>
                setNewCompany({ ...newCompany, logo: e.target.value })
              }
              className="p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="WhatsApp Number (optional)"
              value={newCompany.whatsappNumber}
              onChange={(e) =>
                setNewCompany({ ...newCompany, whatsappNumber: e.target.value })
              }
              className="p-2 border rounded-md"
            />
          </div>
          <textarea
            placeholder="Description (optional)"
            value={newCompany.description}
            onChange={(e) =>
              setNewCompany({ ...newCompany, description: e.target.value })
            }
            className="mt-4 p-2 border rounded-md w-full"
            rows={3}
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCompanyForm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              disabled={createCompany.isLoading || updateCompany.isLoading}
            >
              {createCompany.isLoading || updateCompany.isLoading
                ? "Processing..."
                : newCompany.id
                ? "Update Company"
                : "Create Company"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {/* ... (thead remains the same) */}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.length > 0 ? (
              companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.contactEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.whatsappNumber || "-"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCompany(company)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No companies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderBanners = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Banners</h2>
        <button
          onClick={() => setShowBannerForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Banner
        </button>
      </div>

      {(showBannerForm || editingBanner) && (
        <BannerForm banner={editingBanner} onClose={handleBannerClose} />
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Placement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.length > 0 ? (
              banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{banner.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {banner.placement}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(banner.startDate).toLocaleDateString()} -{" "}
                    {new Date(banner.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        banner.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {banner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingBanner(banner)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => deleteBanner.mutate(banner.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No banners found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderProperties = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Properties</h2>
        <button
          onClick={() => setShowPropertyForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md w-full md:w-1/2"
        />
        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="p-2 border rounded-md w-full md:w-1/3"
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {showPropertyForm && (
        <PropertyForm
          property={editingProperty}
          onClose={handlePropertyClose}
        />
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{property.title}</td>
                  <td className="px-6 py-4">{property.location}</td>
                  <td className="px-6 py-4">
                    ${property.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.tier === "premium"
                          ? "bg-purple-100 text-purple-800"
                          : property.tier === "featured"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.status === "active"
                          ? "bg-green-100 text-green-800"
                          : property.status === "sold"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingProperty(property);
                        setShowPropertyForm(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => deleteProperty.mutate(property.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5 inline" />
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
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Property Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("properties")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "properties"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab("companies")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "companies"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setActiveTab("banners")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "banners"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Banners
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "properties" && renderProperties()}
        {activeTab === "companies" && renderCompanies()}
        {activeTab === "banners" && renderBanners()}
      </div>
    </div>
  );
}

export default AdminDashboard;
