import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface PropertyFormProps {
  property?: Property | undefined;
  onClose: () => void;
}

interface Property {
  id?: string;
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
}

function PropertyForm({ property, onClose }: PropertyFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Property>(
    property || {
      title: "",
      price: 0,
      location: "",
      description: "",
      companyId: "",
      tier: "standard",
      status: "active",
      imageUrl: "",
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: companies = [] } = useQuery<Company[]>(
    "companies",
    async () => {
      const response = await axios.get("http://localhost:5001/api/companies");
      return response.data;
    }
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setImageFile(acceptedFiles[0]);
      setFormData((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(acceptedFiles[0]),
      }));
      console.log("Image selected:", acceptedFiles[0]);
    },
  });

  const mutation = useMutation(
    async (data: Property) => {
      const formDataToSend = new FormData();

      formDataToSend.append("title", data.title);
      formDataToSend.append("description", data.description);
      formDataToSend.append("price", data.price.toString());
      formDataToSend.append("location", data.location);
      formDataToSend.append("companyId", data.companyId);
      formDataToSend.append("tier", data.tier);
      formDataToSend.append("status", data.status);

      if (imageFile) {
        formDataToSend.append("image", imageFile);
        console.log("Sending image:", imageFile);
      } else {
        console.log("No image to send");
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (property?.id) {
        return await axios
          .put(
            `http://localhost:5001/api/properties/${property.id}`,
            formDataToSend,
            config
          )
          .then((res) => res.data);
      } else {
        return await axios
          .post("http://localhost:5001/api/properties", formDataToSend, config)
          .then((res) => res.data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("properties");
        toast.success(
          property
            ? "Property updated successfully"
            : "Property created successfully"
        );
        onClose();
      },
      onError: (error: any) => {
        console.error("Mutation error:", error);
        toast.error(
          `Failed to save property: ${
            error.response?.data?.details || error.message || "Unknown error"
          }`
        );
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId) {
      toast.error("Please select a company");
      return;
    }
    console.log("Submitting form with data:", formData);
    mutation.mutate(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-4 bg-white rounded shadow"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.companyId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, companyId: e.target.value }))
          }
        >
          <option value="">Select a company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.price}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.location}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, location: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tier</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.tier}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              tier: e.target.value as Property["tier"],
            }))
          }
        >
          <option value="standard">Standard</option>
          <option value="featured">Featured</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as Property["status"],
            }))
          }
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Property Image
        </label>
        <div
          {...getRootProps()}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500"
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <input {...getInputProps()} />
              <p className="pl-1">Upload a file or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
          </div>
        </div>
        {formData.imageUrl && (
          <img
            src={formData.imageUrl}
            alt="Preview"
            className="mt-2 max-w-xs rounded"
          />
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading
            ? "Saving..."
            : property
            ? "Update Property"
            : "Create Property"}
        </button>
      </div>
    </form>
  );
}

export default PropertyForm;
