import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface BannerFormProps {
  banner?: Banner;
  onClose: () => void;
}

interface Banner {
  id?: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: 'homepage' | 'listing' | 'search';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

function BannerForm({ banner, onClose }: BannerFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Banner>(banner || {
    title: '',
    imageUrl: '',
    targetUrl: '',
    placement: 'homepage',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      // In a real application, implement image upload to your storage service
      setFormData(prev => ({
        ...prev,
        imageUrl: URL.createObjectURL(acceptedFiles[0])
      }));
    }
  });

  const mutation = useMutation(
    async (data: Banner) => {
      if (banner?.id) {
        const response = await axios.put(`/api/banners/${banner.id}`, data);
        return response.data;
      } else {
        const response = await axios.post('/api/banners', data);
        return response.data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('banners');
        toast.success(banner ? 'Banner updated successfully' : 'Banner created successfully');
        onClose();
      },
      onError: () => {
        toast.error('Failed to save banner');
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Target URL</label>
        <input
          type="url"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.targetUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Placement</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.placement}
          onChange={(e) => setFormData(prev => ({ ...prev, placement: e.target.value as Banner['placement'] }))}
        >
          <option value="homepage">Homepage</option>
          <option value="listing">Listing Page</option>
          <option value="search">Search Results</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Banner Image</label>
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
        >
          {banner ? 'Update Banner' : 'Create Banner'}
        </button>
      </div>
    </form>
  );
}

export default BannerForm;