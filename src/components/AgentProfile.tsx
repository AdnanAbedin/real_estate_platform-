import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { Clock, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AgentProfileProps {
  companyId: string;
}

interface Company {
  id: string;
  name: string;
}

function AgentProfile({ companyId }: AgentProfileProps) {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery(
    ["whatsappStats", companyId],
    async () => {
      const response = await axios.get(
        `http://localhost:5001/api/whatsapp/stats/${companyId}`
      );
      return response.data;
    }
  );

  const { data: company, isLoading: companyLoading } = useQuery(
    ["company", companyId],
    async () => {
      const response = await axios.get(
        `http://localhost:5001/api/companies/${companyId}`
      );
      return response.data as Company;
    }
  );

  const handleClick = () => {
    navigate(`/company/${companyId}/inquiries`);
  };

  if (statsLoading || companyLoading) return <div>Loading stats...</div>;

  return (
    <div
      className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-lg font-semibold mb-4">
        {company?.name ? `${company.name} Statistics` : "Company Statistics"}
      </h3>
      <div className="space-y-4">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" />
          <span>Total Inquiries: {stats?.total || 0}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-indigo-600 mr-2" />
          <span>
            Avg Response Time:{" "}
            {stats?.avgResponseTime
              ? `${Math.round(stats.avgResponseTime)}s`
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" />
          <span>Pending Inquiries: {stats?.pending || 0}</span>
        </div>
      </div>
    </div>
  );
}

export default AgentProfile;
