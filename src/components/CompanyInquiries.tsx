import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  X,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

interface Inquiry {
  id: string;
  propertyId: string;
  companyId: string;
  customerPhone: string;
  message: string;
  responseMessage?: string;
  status: "pending" | "responded";
  createdAt: string;
  respondedAt?: string;
}

interface Company {
  id: string;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL;

function CompanyInquiries() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "responded"
  >("all");

  const { data: inquiries, isLoading } = useQuery<Inquiry[]>(
    ["companyInquiries", companyId],
    async () => {
      const response = await axios.get(
        `${API_URL}/whatsapp/${companyId}/inquiries`
      );
      return response.data;
    }
  );

  const { data: company } = useQuery<Company>(
    ["company", companyId],
    async () => {
      const response = await axios.get(
        `${API_URL}/companies/${companyId}`
      );
      return response.data;
    }
  );

  const respondMutation = useMutation(
    (data: { inquiryId: string; responseMessage: string }) =>
      axios.post(
        `${API_URL}/whatsapp/${data.inquiryId}/respond`,
        {
          responseMessage: data.responseMessage,
          agentId: null, // Explicitly set to null
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["companyInquiries", companyId]);
        toast.success("Response sent successfully");
        setRespondingTo(null);
        setResponseMessage("");
      },
      onError: (error: any) => {
        toast.error(
          `Failed to send response: ${
            error.response?.data?.details || error.message
          }`
        );
      },
    }
  );

  const handleRespond = (inquiryId: string) => {
    if (responseMessage.trim() === "") {
      toast.error("Please enter a response message");
      return;
    }
    respondMutation.mutate({ inquiryId, responseMessage });
  };

  // Filter inquiries based on status
  const filteredInquiries = inquiries?.filter((inquiry) =>
    filterStatus === "all" ? true : inquiry.status === filterStatus
  );

  // Calculate statistics
  const totalInquiries = inquiries?.length || 0;
  const pendingInquiries =
    inquiries?.filter((i) => i.status === "pending").length || 0;
  const respondedInquiries =
    inquiries?.filter((i) => i.status === "responded").length || 0;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {company?.name || "Company"} WhatsApp Inquiries
          </h2>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Inquiries</p>
              <p className="text-2xl font-semibold">{totalInquiries}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold">{pendingInquiries}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Responded</p>
              <p className="text-2xl font-semibold">{respondedInquiries}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-md transition ${
            filterStatus === "all"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          All Inquiries
        </button>
        <button
          onClick={() => setFilterStatus("pending")}
          className={`px-4 py-2 rounded-md transition ${
            filterStatus === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilterStatus("responded")}
          className={`px-4 py-2 rounded-md transition ${
            filterStatus === "responded"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Responded
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInquiries && filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {inquiry.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs sm:max-w-sm overflow-hidden text-ellipsis">
                        {inquiry.message}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs sm:max-w-sm overflow-hidden text-ellipsis">
                        {inquiry.responseMessage || (
                          <span className="text-gray-400 italic">
                            Not responded yet
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          inquiry.status === "responded"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {inquiry.status === "responded" ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(inquiry.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inquiry.status === "pending" && (
                        <>
                          {respondingTo === inquiry.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={responseMessage}
                                onChange={(e) =>
                                  setResponseMessage(e.target.value)
                                }
                                placeholder="Type your response..."
                                className="border border-gray-300 rounded-md p-2 text-sm w-48"
                              />
                              <button
                                onClick={() => handleRespond(inquiry.id)}
                                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition"
                                disabled={respondMutation.isLoading}
                              >
                                <Send className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setRespondingTo(null)}
                                className="text-gray-600 hover:text-gray-800 p-2"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRespondingTo(inquiry.id)}
                              className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded-md text-sm font-medium transition"
                            >
                              Respond
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No inquiries found</p>
                    {filterStatus !== "all" && (
                      <button
                        onClick={() => setFilterStatus("all")}
                        className="text-indigo-600 hover:text-indigo-800 mt-2 text-sm font-medium"
                      >
                        Show all inquiries
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CompanyInquiries;
