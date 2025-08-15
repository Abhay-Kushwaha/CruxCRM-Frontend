"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  MessageSquare,
  Send,
  Clock,
  Search,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  AlertTriangle,
  Users,
  Loader2
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import NewCampaignDialog from '../../../../components/CampaignDialog';
import axios from '@/lib/Axios'; // Assuming this is your configured axios instance
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define TypeScript interfaces based on API response
interface Lead {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isEmailOpened?: boolean;
  emailOpenedAt?: string | null;
}

interface Campaign {
  id: string; // Mapped from _id
  title: string;
  description: string;
  type: 'mail' | 'sms' | string;
  category: string;
  status: 'sent' | 'draft';
  sentCount: number;
  totalCount: number;
  openRate: number;
  createdBy: string;
  createdAt: string;
  lastSent: string | null;
  leads: Lead[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onView: (campaign: Campaign) => void;
  onSend: (id: string) => void;
}

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignTitle: string;
}

interface SendConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignTitle: string;
}

interface ViewLeadsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}


// Delete Confirmation Dialog
const DeleteDialog: React.FC<DeleteDialogProps> = ({ isOpen, onClose, onConfirm, campaignTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Campaign</h3>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete "<strong>{campaignTitle}</strong>"? This action cannot be undone.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Send Confirmation Dialog
const SendConfirmationDialog: React.FC<SendConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, campaignTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send Campaign</h3>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to send "<strong>{campaignTitle}</strong>" now? This action will make the campaign live.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send Now
          </button>
        </div>
      </div>
    </div>
  );
};

// View Leads Dialog
const ViewLeadsDialog: React.FC<ViewLeadsDialogProps> = ({ isOpen, onClose, campaign }) => {
  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${campaign.type === 'mail' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}>
              {campaign.type === 'mail' ? (
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Campaign Leads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          {campaign.leads.map((lead) => (
            <div key={lead._id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{lead.email}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Leads:</span>
            <span className="font-medium text-gray-900 dark:text-white">{campaign.leads.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600 dark:text-gray-400">Campaign Status:</span>
            <span className={`font-medium ${campaign.status === 'sent' ? 'text-green-600' : 'text-yellow-600'}`}>
              {campaign.status === 'sent' ? 'Sent' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignManagement: React.FC = () => {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; campaignId: string | null; campaignTitle: string }>({
    isOpen: false,
    campaignId: null,
    campaignTitle: ''
  });
  const [sendDialog, setSendDialog] = useState<{ isOpen: boolean; campaignId: string | null; campaignTitle: string }>({
    isOpen: false,
    campaignId: null,
    campaignTitle: ''
  });
  const [viewLeadsDialog, setViewLeadsDialog] = useState<{ isOpen: boolean; campaign: Campaign | null }>({
    isOpen: false,
    campaign: null
  });

  const isAnyDialogOpen = deleteDialog.isOpen || sendDialog.isOpen || viewLeadsDialog.isOpen;

  useEffect(() => {
    if (isAnyDialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyDialogOpen]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/campaign/all');
        
        const formattedCampaigns = response.data.data.map((c: any): Campaign => ({
          id: c._id,
          title: c.title,
          description: c.description,
          type: c.type,
          category: c.category ||"GENERAL", // Fallback if category is not in API response
          status: c.status, // Assuming all fetched campaigns are sent
          sentCount: c.totalLeads,
          totalCount: c.totalLeads,
          openRate: 0,
          createdBy: c.createdBy || 'Manager',
          createdAt: new Date(c.createdAt).toLocaleDateString(),
          lastSent: new Date(c.createdAt).toLocaleDateString(),
          leads: c.leads || [],
        }));
        setCampaigns(formattedCampaigns);
      } catch (error) {
        toast.error("Failed to fetch campaigns.");
        console.error("Fetch campaigns error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);


  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const draftCampaigns = campaigns.filter(c => c.status === 'draft');
  const totalMessagesSent = sentCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalRecipients = campaigns.reduce((sum, c) => sum + c.totalCount, 0);

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteCampaign = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      setDeleteDialog({
        isOpen: true,
        campaignId: id,
        campaignTitle: campaign.title
      });
    }
  };

  const confirmDelete = async () => {
    if (deleteDialog.campaignId) {
      try {
        await axios.delete(`/campaign/delete/${deleteDialog.campaignId}`);
        setCampaigns(prev => prev.filter(c => c.id !== deleteDialog.campaignId));
        toast.success(`Campaign "${deleteDialog.campaignTitle}" deleted successfully.`);
      } catch (error) {
        toast.error("Failed to delete the campaign.");
        console.error("Delete error:", error);
      } finally {
        setDeleteDialog({ isOpen: false, campaignId: null, campaignTitle: '' });
      }
    }
  };
const onEdit = (id: string) => {
    router.push(`/manager/campaign/update/${id}`);
  };
  const onResend = (id: string) => {
    router.push(`/manager/campaign/resend/${id}`);
  };
  const handleSendCampaign = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      setSendDialog({
        isOpen: true,
        campaignId: id,
        campaignTitle: campaign.title
      });
      const data=axios.post(`/campaign/send/${id}`, {
        // Include any necessary data for the send request
        campaignId: id
      });
    }
  };

  const confirmSend = async () => {
    if (sendDialog.campaignId) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCampaigns(prev => prev.map(campaign =>
        campaign.id === sendDialog.campaignId
          ? { ...campaign, status: 'sent' as const, sentCount: campaign.totalCount, lastSent: new Date().toISOString().split('T')[0] }
          : campaign
      ));
      setSendDialog({ isOpen: false, campaignId: null, campaignTitle: '' });
    }
  };

  const handleViewLeads = async (campaign: Campaign) => {
    try {
      const response = await axios.get(`/campaign/${campaign.id}`);
      // The API returns the campaign object under the `data` key
      if (response.data && response.data.data) {
        // Map API response to our Campaign interface for consistency
        const detailedCampaign: Campaign = {
          ...campaign, // Keep existing data
          leads: response.data.data.leads || [], // Update leads from detailed view
        };
        setViewLeadsDialog({ isOpen: true, campaign: detailedCampaign });
      } else {
         toast.error("Invalid data received for campaign details.");
      }
    } catch (error) {
      toast.error("Failed to fetch campaign details.");
      console.error("View leads error:", error);
    }
  };
  
  // Analytics Data Derivation
  const campaignTypeData = useMemo(() => {
    const counts = campaigns.reduce((acc, campaign) => {
      const type = campaign.type === 'mail' ? 'Email' : 'SMS';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Email', value: counts['Email'] || 0, color: '#3B82F6' },
      { name: 'SMS', value: counts['SMS'] || 0, color: '#10B981' }
    ].filter(item => item.value > 0);
  }, [campaigns]);

  const categoryData = useMemo(() => {
     const counts = campaigns.reduce((acc, campaign) => {
      const category = campaign.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  }, [campaigns]);


  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDelete, onView, onSend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${campaign.type === 'mail' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}>
            {campaign.type === 'mail' ? (
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{campaign.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            campaign.status === 'sent'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
            {campaign.status === 'sent' ? 'Sent' : 'Draft'}
          </span>
          {campaign.status ==='sent'&& (
            <button
              onClick={() => onResend(campaign.id)} 
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Send className="h-3 w-3" />
              <span>Resend</span>
            </button>
          )}
          {campaign.status === 'draft' && (
            <button
              onClick={() => onSend(campaign.id)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Send className="h-3 w-3" />
              <span>Send</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
          <p className="font-semibold text-gray-900 dark:text-white">{campaign.category}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Recipients</p>
          <p className="font-semibold text-gray-900 dark:text-white">{campaign.totalCount}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sent</p>
          <p className="font-semibold text-gray-900 dark:text-white">{campaign.sentCount}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
          <p className="font-semibold text-gray-900 dark:text-white">{campaign.createdAt}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {campaign.createdBy.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.createdBy}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {campaign.lastSent ? `Last sent: ${campaign.lastSent}` : 'Never sent'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(campaign)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="View Leads"
          >
            <Eye className="h-4 w-4 text-gray-500" />
          </button>
          {campaign.status === 'draft' && (
            <button onClick={() => onEdit(campaign.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Edit className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={() => onDelete(campaign.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Delete Campaign"
          >
            <Trash2 className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Campaign Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage email and SMS campaigns for your leads
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <NewCampaignDialog />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mb-8 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {['overview', 'campaigns', 'analytics'].map((tab: string) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Campaigns"
                value={totalCampaigns}
                icon={Mail}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
              />
              <StatCard
                title="Messages Sent"
                value={totalMessagesSent}
                icon={Send}
                color="bg-gradient-to-r from-green-500 to-green-600"
              />
              <StatCard
                title="Total Recipients"
                value={totalRecipients}
                icon={Users}
                color="bg-gradient-to-r from-purple-500 to-purple-600"
              />
              <StatCard
                title="Draft Campaigns"
                value={draftCampaigns.length}
                icon={Clock}
                color="bg-gradient-to-r from-orange-500 to-orange-600"
              />
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Campaigns</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Latest campaigns created by your team</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign: Campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onDelete={handleDeleteCampaign}
                      onView={handleViewLeads}
                      onSend={handleSendCampaign}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="draft">Draft</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="mail">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>

            {/* Campaign List */}
            <div className="space-y-4">
              {filteredCampaigns.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No campaigns found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredCampaigns.map((campaign: Campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onDelete={handleDeleteCampaign}
                    onView={handleViewLeads}
                    onSend={handleSendCampaign}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Types Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Types</h3>
                 <ResponsiveContainer width="100%" height={300}>
                   <PieChart>
                     <Pie data={campaignTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                       {campaignTypeData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
              </div>
              {/* Categories Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Dialogs */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, campaignId: null, campaignTitle: '' })}
        onConfirm={confirmDelete}
        campaignTitle={deleteDialog.campaignTitle}
      />

      <SendConfirmationDialog
        isOpen={sendDialog.isOpen}
        onClose={() => setSendDialog({ isOpen: false, campaignId: null, campaignTitle: '' })}
        onConfirm={confirmSend}
        campaignTitle={sendDialog.campaignTitle}
      />

      <ViewLeadsDialog
        isOpen={viewLeadsDialog.isOpen}
        onClose={() => setViewLeadsDialog({ isOpen: false, campaign: null })}
        campaign={viewLeadsDialog.campaign}
      />
    </div>
  );
};

export default CampaignManagement;