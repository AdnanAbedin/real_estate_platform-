import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface BannerFormProps {
  banner?: Banner;
  onClose: () => void;
}

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

const API_URL = import.meta.env.VITE_API_URL ;


function BannerForm({ banner, onClose }: BannerFormProps) {
  const queryClient = useQueryClient();


  const getDefaultDates = () => {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    return {
      startDate: today.toISOString().split("T")[0],
      endDate: thirtyDaysLater.toISOString().split("T")[0],
    };
  };

  // Format date to YYYY-MM-DD if needed
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState<Banner>(() => {
    if (banner) {
      return {
        ...banner,
        startDate: formatDate(banner.startDate),
        endDate: formatDate(banner.endDate),
      };
    }
    const { startDate, endDate } = getDefaultDates();
    return {
      title: "",
      imageUrl: "",
      targetUrl: "",
      placement: "homepage",
      startDate,
      endDate,
      status: "active",
    };
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // Update formData when banner prop changes
  useEffect(() => {
    if (banner) {
      setFormData({
        ...banner,
        startDate: formatDate(banner.startDate),
        endDate: formatDate(banner.endDate),
      });
    }
  }, [banner]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setImageFile(acceptedFiles[0]);
      setFormData((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(acceptedFiles[0]),
      }));
    },
  });

  const mutation = useMutation(
    async (data: Banner) => {
      const formDataToSend = new FormData();
      formDataToSend.append("title", data.title);
      formDataToSend.append("targetUrl", data.targetUrl);
      formDataToSend.append("placement", data.placement);
      formDataToSend.append("startDate", data.startDate);
      formDataToSend.append("endDate", data.endDate);
      formDataToSend.append("status", data.status);

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (banner?.id) {
        return await axios
          .put(
            `${API_URL}/banners/${banner.id}`,
            formDataToSend,
            config
          )
          .then((res) => res.data);
      } else {
        return await axios
          .post(`${API_URL}/banners`, formDataToSend, config)
          .then((res) => res.data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("banners");
        toast.success(
          banner ? "Banner updated successfully" : "Banner created successfully"
        );
        onClose();
      },
      onError: (error: any) => {
        toast.error(
          `Failed to save banner: ${
            error.response?.data?.details || error.message
          }`
        );
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !banner?.imageUrl) {
      toast.error("Please upload a banner image");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-4 bg-white rounded shadow"
    >
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
        <label className="block text-sm font-medium text-gray-700">
          Target URL
        </label>
        <input
          type="url"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.targetUrl}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, targetUrl: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Placement
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.placement}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              placement: e.target.value as Banner["placement"],
            }))
          }
        >
          <option value="homepage">Homepage</option>
          <option value="listing">Listing Page</option>
          <option value="search">Search Results</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.startDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.endDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
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
              status: e.target.value as Banner["status"],
            }))
          }
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Banner Image
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
            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
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
            : banner
            ? "Update Banner"
            : "Create Banner"}
        </button>
      </div>
    </form>
  );
}

export default BannerForm;
