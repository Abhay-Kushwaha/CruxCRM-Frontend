"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronDown, MessageSquare, PhoneOffIcon, Trash2, Edit, Filter, X, Eye, ExternalLink } from 'lucide-react';
import { useRouter } from "next/navigation";
import axios from "@/lib/Axios";
import Pagination from '@/../components/Pagination';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import LeadDetailsDialog from '@/../components/LeadDetailsDialog';

// Define the Lead interface
interface Lead {
  id: string;
  leadInfo: {
    name: string;
    position: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  status: 'new' | 'in-progress' | 'follow-up' | 'closed';
  priority: 'high' | 'medium' | 'low';
  assignedTo: { name: string | null }; // Allowed null for unassigned leads
  document: Array<{
    url: string;
    description: string;
    id: string;
    size: number;
  }>;
  category: string;
  catColor: string;
  lastContact: string;
  followUpDate: string;
}

// API function to simulate fetching leads
const fetchLeads = async (page: number, setCurrentPage: (n: number) => void, setTotalPages: (n: number) => void): Promise<Lead[]> => {
  try {
    const res = await axios.get("/lead/getalllead", { params: { page } });
    const { data } = res.data;
    if (!data || !data.leads || !data.pagination) {
      throw new Error("Invalid response structure from server.");
    }
    setCurrentPage(data.pagination.currentPage);
    setTotalPages(data.pagination.totalPages);
    console.log("Backend Data>>>", data.leads);
    const mappedLeads: Lead[] = data.leads.map((lead: any) => ({
      id: lead.id,
      leadInfo: {
        name: lead.name,
        position: lead.position || "Unknown Position",
      },
      contact: {
        email: lead.email || "No Email",
        phone: (lead.phoneNumber === null) ? "No Phone Number" : String(lead.phoneNumber),
      },
      status: lead.status || "new",
      priority: lead.priority || "low",
      assignedTo: lead.assignedTo || { name: "Unassigned" },
      document: lead.documents?.map((doc: any) => ({
        id: doc._id || doc.id,
        url: doc.url,
        description: doc.description || 'Untitled Document',
        size: doc.size || 0
      })) || [],
      category: lead.category ? lead.category.title : "Un-Categorized",
      catColor: lead.category ? lead.category.color : "#d1d5db",
      lastContact: new Date(lead.createdAt).toLocaleDateString("en-GB"),
      followUpDate: lead.followUpDates && lead.followUpDates.length > 0 ? new Date(lead.followUpDates[lead.followUpDates.length - 1]).toLocaleDateString("en-GB") : "",
    }));
    console.log("Map data >>>", mappedLeads);
    return mappedLeads;
  }
  catch (error: any) {
    console.error("Axios error fetching leads:", error?.response || error.message);
    throw error;
  }
};

// API function to simulate deleting a lead
const deleteLeadApi = async (leadId: string): Promise<void> => {
  try {
    const res = await axios.delete(`/lead/deletelead/${leadId}`);
    if (!res.data.success) {
      throw new Error(res.data.error.message || "Failed to delete lead.");
    }
    console.log(`Lead with ID ${leadId} deleted successfully`);
    toast.success("Lead deleted successfully!");
  }
  catch (error: any) {
    console.error(`Error deleting lead ${leadId}:`, error?.response || error.message);
    toast.error(error?.response?.data.error.message || "Failed to delete lead.");
  }
};

// Custom Dropdown Component
const CustomDropdown = ({
  trigger,
  children,
  className = ""
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${className}`}
      >
        {trigger}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-lg right-0">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                const element = child as React.ReactElement<any>;
                return React.cloneElement(element, {
                  onClick: () => {
                    if (element.props.onClick) element.props.onClick();
                    setIsOpen(false);
                  }
                });
              }
              return child;
            })}
          </div>
        </>
      )}
    </div>
  );
};

const DropdownItem = ({
  children,
  onClick,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <div
    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// Confirmation Delete Dialog Component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedWorker, setSelectedWorker] = useState<string>('All');
  const [assignmentFilter, setAssignmentFilter] = useState<'All' | 'Assigned' | 'Unassigned'>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [showFilterControls, setShowFilterControls] = useState(false);
  const [NoCatOnlyAssign, setNoCatOnlyAssign] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [showEndConvoDialog, setShowEndConvoDialog] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({ date: '', conclusion: '' });
  const [endConvoForm, setEndConvoForm] = useState({ type: 'positive', conclusion: '' });
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentType[]>([]);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  // Detect worker cookie (001)
  const [isWorker, setIsWorker] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<Array<{ title: string; color: string }>>([]);
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    setIsWorker(cookies.some(c => c.startsWith('001')));
    setShowFilterControls(cookies.some(c => c.startsWith('002')));
    if (cookies.some(c => c.startsWith('001'))) {
      setNoCatOnlyAssign(true);
      setShowDateFilter(true);
    }
  }, []);

  // Fetch leads on component mount and when currentPage changes
  useEffect(() => {
    const getLeads = async () => {
      try {
        setLoading(true);
        const data = await fetchLeads(currentPage, setCurrentPage, setTotalPages);
        setLeads(data);
      } catch (err) {
        setError('An unexpected error occurred while fetching leads.');
      } finally {
        setLoading(false);
      }
    };
    getLeads();
  }, [currentPage]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/category');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Extract unique workers from the leads data
  const workers = useMemo(() => {
    const assignedToNames = new Set<string>();
    leads.forEach((lead) => {
      if (lead.assignedTo.name) {
        assignedToNames.add(lead.assignedTo.name);
      }
    });
    return ['All', ...Array.from(assignedToNames).sort()];
  }, [leads]);

  // Filter leads based on search term, assignment status, and selected worker
  const filteredLeads = useMemo(() => {
    let currentLeads = leads;
    if (assignmentFilter === 'Unassigned') {
      currentLeads = currentLeads.filter((lead) => lead.assignedTo.name === "Unassigned");
    }
    else if (assignmentFilter === 'All') {
      currentLeads = currentLeads;
    }
    else {
      currentLeads = currentLeads.filter((lead) => lead.assignedTo.name !== "Unassigned");
    }

    // Apply worker filter (only if assignment filter is 'All' or 'Assigned')
    if (selectedWorker !== 'All' && assignmentFilter !== 'Unassigned') {
      currentLeads = currentLeads.filter((lead) => lead.assignedTo.name === selectedWorker);
    }
    else if (selectedWorker !== 'All' && assignmentFilter === 'Unassigned') {
      currentLeads = [];
    }

    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentLeads = currentLeads.filter(
        (lead) =>
          lead.leadInfo.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          lead.leadInfo.position.toLowerCase().includes(lowerCaseSearchTerm) ||
          lead.contact.email.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Apply date filter if enabled and selected
    if (showDateFilter && selectedDate) {
      const [year, month, day] = selectedDate.split('-');
      const formattedSelectedDate = `${day}/${month}/${year}`;
      currentLeads = currentLeads.filter((lead) => {
        return lead.followUpDate === formattedSelectedDate;
      });
    }

    // Apply status filter
    if (selectedStatus !== 'All') {
      currentLeads = currentLeads.filter((lead) => lead.status === selectedStatus);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      currentLeads = currentLeads.filter((lead) => lead.category === selectedCategory);
    }

    return currentLeads;
  }, [leads, searchTerm, selectedWorker, assignmentFilter, showDateFilter, selectedDate, selectedStatus, selectedCategory]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleWorkerSelect = useCallback((worker: string) => {
    setSelectedWorker(worker);
  }, []);

  const handleAssignmentFilter = useCallback((filter: 'All' | 'Assigned' | 'Unassigned') => {
    setAssignmentFilter(filter);
    // When changing assignment filter, reset worker filter if it becomes incompatible
    if (filter === 'Unassigned' && selectedWorker !== 'All') {
      setSelectedWorker('All');
    }
  }, [selectedWorker]);

  const handleDeleteClick = useCallback((leadId: string) => {
    setLeadToDelete(leadId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (leadToDelete) {
      try {
        await deleteLeadApi(leadToDelete); // Call the mock API
        setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadToDelete));
        loadLeads()
        setIsDeleteDialogOpen(false);
        setLeadToDelete(null);
      } catch (err: any) {
        toast.error(err.message);
        loadLeads()
        setIsDeleteDialogOpen(false);
        setLeadToDelete(null);
      }
    }
  }, [leadToDelete]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setLeadToDelete(null);
  }, []);

  const handleViewLeadDetails = async (leadId: string) => {
    try {
      const response = await axios.get(`/lead/getlead/${leadId}`);
      if (response.data.success) {
        setSelectedLeadDetails(response.data.data);
        setShowLeadDetails(true);
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
      toast.error('Failed to fetch lead details');
    }
  };

  const getStatusBadgeColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'follow-up':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const editlead = (leadId: string) => {
    router.push(`/leads/update-leads/${leadId}`);
  };

  const getPriorityBadgeColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Document Viewer Modal
  interface DocumentType {
    url: string;
    description: string;
    id: string;
    size: number;
  }
  const DocumentViewer = ({
    documents,
    isOpen,
    onClose
  }: {
    documents: DocumentType[];
    isOpen: boolean;
    onClose: () => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-3xl max-h-2xl mx-5 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Documents ({documents.length})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {doc.description || `Document ${index + 1}`}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(doc.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span className="text-sm font-medium">View</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No documents available for this lead.
            </div>
          )}
        </div>
      </div>
    );
  };

  const loadLeads = useCallback(async () => {
    try {
      const data = await fetchLeads(currentPage, setCurrentPage, setTotalPages);
      setLeads(data);
    } catch (err) {
      console.error("Failed to refresh leads:", err);
    }
  }, [currentPage]);
  useEffect(() => {
    loadLeads();
    const interval = setInterval(() => {
      console.log("Refreshing leads every 10 minutes...");
      loadLeads();
    }, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, [loadLeads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <p className="text-lg text-red-700 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172B] text-gray-900 dark:text-gray-100">
      {/* Header Section */}
      <header className="bg-[#F9FAFB] dark:bg-[#0F172B]">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Management</h1>
              <p className="text-gray-600 mt-1 dark:text-white">Manage and track all your leads</p>
            </div>
            <button
              onClick={() => loadLeads()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800" size={20} />
              <input
                type="text"
                placeholder="Search leads by name, position, or email..."
                className="w-full lg:w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Status Filter Dropdown */}
            <CustomDropdown
              trigger={
                <>
                  <span className="truncate max-w-[120px] text-gray-600">{selectedStatus === 'All' ? 'All Statuses' : selectedStatus}</span>
                  <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                </>
              }
            >
              <DropdownItem
                onClick={() => setSelectedStatus('All')}
                className={selectedStatus === 'All' ? 'bg-blue-50 text-blue-600' : ''}
              >
                All Statuses
              </DropdownItem>
              <DropdownItem
                onClick={() => setSelectedStatus('new')}
                className={selectedStatus === 'new' ? 'bg-blue-50 text-blue-600' : ''}
              >
                New
              </DropdownItem>
              <DropdownItem
                onClick={() => setSelectedStatus('in-progress')}
                className={selectedStatus === 'in-progress' ? 'bg-blue-50 text-blue-600' : ''}
              >
                In Progress
              </DropdownItem>
              <DropdownItem
                onClick={() => setSelectedStatus('follow-up')}
                className={selectedStatus === 'follow-up' ? 'bg-blue-50 text-blue-600' : ''}
              >
                Follow Up
              </DropdownItem>
              <DropdownItem
                onClick={() => setSelectedStatus('closed')}
                className={selectedStatus === 'closed' ? 'bg-blue-50 text-blue-600' : ''}
              >
                Closed
              </DropdownItem>
            </CustomDropdown>

            {/* Category Filter Dropdown */}
            <CustomDropdown
              trigger={
                <>
                  <span className="truncate max-w-[120px] text-gray-600">{selectedCategory === 'All' ? 'All Categories' : selectedCategory}</span>
                  <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                </>
              }
            >
              <DropdownItem
                onClick={() => setSelectedCategory('All')}
                className={selectedCategory === 'All' ? 'bg-blue-50 text-blue-600' : ''}
              >
                All Categories
              </DropdownItem>
              {categories.map((category) => (
                <DropdownItem
                  key={category.title}
                  onClick={() => setSelectedCategory(category.title)}
                  className={selectedCategory === category.title ? 'bg-blue-50 text-blue-600' : ''}
                >
                  {category.title}
                </DropdownItem>
              ))}
            </CustomDropdown>

            {/* Date Filter for worker */}
            {showDateFilter && (
              <div className="flex flex-col md:flex-row items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Select by Follow-Up Date:</label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[180px] justify-start text-left font-normal"
                    >
                      {selectedDate ? format(new Date(selectedDate), "PPP") : <span className="text-gray-400">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate ? parse(selectedDate, "yyyy-MM-dd", new Date()) : undefined}
                      onSelect={(date) => {
                        if (date) setSelectedDate(format(date, "yyyy-MM-dd"));
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>

                {selectedDate && (
                  <button
                    type="button"
                    className="ml-1 text-gray-400 hover:text-red-500"
                    onClick={() => setSelectedDate("")}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Filter Controls (visible only for cookies starting with '002') */}
            {showFilterControls && (
              <div className="flex gap-2 sm:gap-4">
                {/* Assignment Filter Dropdown */}
                <CustomDropdown
                  trigger={
                    <>
                      <Filter className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">
                        {assignmentFilter === 'All' ? 'Filter by Assignment' : assignmentFilter}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </>
                  }
                >
                  <DropdownItem
                    onClick={() => handleAssignmentFilter('All')}
                    className={assignmentFilter === 'All' ? 'bg-blue-50 text-blue-600' : ''}
                  >
                    All Leads
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => handleAssignmentFilter('Assigned')}
                    className={assignmentFilter === 'Assigned' ? 'bg-blue-50 text-blue-600' : ''}
                  >
                    Assigned
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => handleAssignmentFilter('Unassigned')}
                    className={assignmentFilter === 'Unassigned' ? 'bg-blue-50 text-blue-600' : ''}
                  >
                    Unassigned
                  </DropdownItem>
                </CustomDropdown>

                {/* Worker Filter Dropdown */}
                <CustomDropdown
                  trigger={
                    <>
                      <span className="truncate max-w-[120px]">{selectedWorker === 'All' ? 'All Workers' : selectedWorker}</span>
                      <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                    </>
                  }
                >
                  {workers.map((worker) => (
                    <DropdownItem
                      key={worker}
                      onClick={() => handleWorkerSelect(worker)}
                      className={selectedWorker === worker ? 'bg-blue-50 text-blue-600' : ''}
                    >
                      {worker === null ? 'Unassigned' : worker}
                    </DropdownItem>
                  ))}
                </CustomDropdown>
              </div>
            )}
          </div>
        </div>

        {/* Leads Section */}
        <div className="bg-white dark:bg-[#0F172B] rounded-lg shadow-sm border">
          <div className="flex justify-between gap-5 p-4 sm:p-6 border-b">
            <div className='pr-2'>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Leads ({filteredLeads.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Complete list of leads in your system</p>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block ">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0F172B]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {NoCatOnlyAssign ? 'Category' : 'Assigned To'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y dark:bg-[#0F172B] divide-gray-200">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium dark:text-white text-gray-900">{lead.leadInfo.name}</div>
                          <div className="text-sm text-gray-500">{lead.leadInfo.position}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{lead.contact.email}</div>
                          <div className="text-sm text-gray-500">{lead.contact.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="px-7 py-5 whitespace-nowrap text-sm text-white dark:text-black">
                          {NoCatOnlyAssign ? (
                            <span
                              className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                              style={{
                                backgroundColor: lead.catColor || "#6b7280",
                              }}
                            >
                              {lead.category || "Un-Categorized"}
                            </span>
                          ) : (
                            <span className="text-black dark:text-white">
                              {lead.assignedTo?.name || "Unassigned"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 dark:text-white whitespace-nowrap text-sm text-gray-900">
                          {lead.lastContact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center justify-self-end gap-3 space-x-2">
                            {NoCatOnlyAssign && (
                              <>
                                {lead.status !== "closed" && (
                                  <>
                                    <button
                                      onClick={() => { setActiveLeadId(lead.id); setShowFollowUpDialog(true); }}
                                      className="text-gray-400 hover:text-yellow-600 transition-colors cursor-pointer"
                                    >
                                      <MessageSquare size={18} />
                                    </button>
                                    <button
                                      onClick={() => { setActiveLeadId(lead.id); setShowEndConvoDialog(true); }}
                                      className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                    >
                                      <PhoneOffIcon size={18} />
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {/* FollowUp Dialog */}
                            {showFollowUpDialog && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
                                <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-lg mx-auto p-6 md:p-8">
                                  <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold">Add Follow-up</h3>
                                    <button
                                      onClick={() => {
                                        setShowFollowUpDialog(false);
                                        loadLeads();
                                        setFollowUpForm({ date: '', conclusion: '' });
                                      }}
                                      className="text-gray-500 hover:text-red-500 transition"
                                    >
                                      <X size={24} />
                                    </button>
                                  </div>
                                  <form
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      try {
                                        await axios.post(`/lead/${activeLeadId}/follow-up`, {
                                          followUpDate: followUpForm.date,
                                          conclusion: followUpForm.conclusion,
                                        });
                                        console.log("Follow-up Form Data:", followUpForm);
                                        toast.success('Follow-up added successfully!');
                                        setShowFollowUpDialog(false);
                                        loadLeads();
                                        setFollowUpForm({ date: '', conclusion: '' });
                                      } catch (err: any) {
                                        console.error("Error adding follow-up:", err?.response?.data?.error.message);
                                        toast.error(err?.response?.data?.error.message || 'Failed to add follow-up.');
                                      }
                                    }}
                                  >
                                    <div className="mb-5">
                                      <label className="block text-sm font-medium mb-2">Follow-up Date</label>
                                      <input
                                        type="date"
                                        value={followUpForm.date}
                                        onChange={e => setFollowUpForm(f => ({ ...f, date: e.target.value }))}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                      />
                                    </div>
                                    <div className="mb-6">
                                      <label className="block text-sm font-medium mb-2">Conclusion</label>
                                      <textarea
                                        value={followUpForm.conclusion}
                                        onChange={e => setFollowUpForm(f => ({ ...f, conclusion: e.target.value }))}
                                        placeholder="Add any relevant notes here..."
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        required
                                      />
                                    </div>
                                    <button
                                      type="submit"
                                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md shadow-md transition"
                                    >
                                      Submit
                                    </button>
                                  </form>
                                </div>
                              </div>
                            )}

                            {/* End Conversation Dialog */}
                            {showEndConvoDialog && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                                <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-lg mx-auto p-6 md:p-8">
                                  <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold">End Conversation</h3>
                                    <button
                                      onClick={() => {
                                        setShowEndConvoDialog(false);
                                        loadLeads();
                                        setEndConvoForm({ type: 'positive', conclusion: '' });
                                      }}
                                      className="text-gray-500 hover:text-red-500 transition"
                                    >
                                      <X size={24} />
                                    </button>
                                  </div>
                                  <form
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      try {
                                        console.log("End Conversation Form Data:", endConvoForm);
                                        const isProfitable = endConvoForm.type === 'positive';
                                        await axios.put(`/lead/endconvo/${activeLeadId}`, {
                                          isProfitable,
                                          conclusion: endConvoForm.conclusion,
                                        });
                                        toast.success('Conversation ended successfully!');
                                        setShowEndConvoDialog(false);
                                        loadLeads();
                                        setEndConvoForm({ type: 'positive', conclusion: '' });
                                      } catch (err: any) {
                                        toast.error(err?.response?.data?.error.message || 'Failed to end conversation.');
                                      }
                                    }}
                                  >
                                    <div className="mb-5">
                                      <label className="block text-sm font-medium mb-2">Type</label>
                                      <div className="flex gap-6">
                                        {['positive', 'negative'].map((type) => (
                                          <label key={type} className="flex items-center gap-2 text-sm">
                                            <input
                                              type="radio"
                                              name="type"
                                              value={type}
                                              checked={endConvoForm.type === type}
                                              onChange={() => setEndConvoForm(f => ({ ...f, type }))}
                                              className="accent-blue-600"
                                            />
                                            <span className="capitalize">{type}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="mb-6">
                                      <label className="block text-sm font-medium mb-2">Conclusion</label>
                                      <textarea
                                        value={endConvoForm.conclusion}
                                        onChange={e => setEndConvoForm(f => ({ ...f, conclusion: e.target.value }))}
                                        placeholder="Add any relevant notes here..."
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                        required
                                      />
                                    </div>
                                    <button
                                      type="submit"
                                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-md shadow-md transition"
                                    >
                                      Submit
                                    </button>
                                  </form>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => handleViewLeadDetails(lead.id)}
                              className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="View Lead Details"
                            >
                              <Eye size={18} />
                            </button>

                            <button onClick={() => editlead(lead.id)} className="text-gray-400 hover:text-yellow-600 transition-colors cursor-pointer">
                              <Edit size={18} />
                            </button>
                            {!isWorker && (
                              <button
                                onClick={() => handleDeleteClick(lead.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No leads found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            <div className="divide-y divide-gray-200">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <div key={lead.id} className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{lead.leadInfo.name}</h3>
                        <p className="text-sm text-gray-500">{lead.leadInfo.position}</p>
                      </div>
                      <div className="flex space-x-2">
                        {NoCatOnlyAssign && (
                          <>
                            {lead.status !== "closed" && (
                              <>
                                <button
                                  onClick={() => { setActiveLeadId(lead.id); setShowFollowUpDialog(true); }}
                                  className="text-gray-400 hover:text-yellow-600 transition-colors cursor-pointer"
                                >
                                  <MessageSquare size={18} />
                                </button>
                                <button
                                  onClick={() => { setActiveLeadId(lead.id); setShowEndConvoDialog(true); }}
                                  className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                  <PhoneOffIcon size={18} />
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {/* FollowUp Dialog */}
                        {showFollowUpDialog && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
                            <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-lg mx-auto p-6 md:p-8">
                              <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Add Follow-up</h3>
                                <button
                                  onClick={() => {
                                    setShowFollowUpDialog(false);
                                    loadLeads();
                                    setFollowUpForm({ date: '', conclusion: '' });
                                  }}
                                  className="text-gray-500 hover:text-red-500 transition"
                                >
                                  <X size={24} />
                                </button>
                              </div>
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  try {
                                    await axios.post(`/lead/${activeLeadId}/follow-up`, {
                                      followUpDate: followUpForm.date,
                                      conclusion: followUpForm.conclusion,
                                    });
                                    console.log("Follow-up Form Data:", followUpForm);
                                    toast.success('Follow-up added successfully!');
                                    setShowFollowUpDialog(false);
                                    loadLeads();
                                    setFollowUpForm({ date: '', conclusion: '' });
                                  } catch (err: any) {
                                    console.error("Error: ", err?.response?.data?.error.message);
                                    toast.error(err?.response?.data?.error.message || 'Failed to add follow-up.');
                                  }
                                }}
                              >
                                <div className="mb-5">
                                  <label className="block text-sm font-medium mb-2">Follow-up Date</label>
                                  <input
                                    type="date"
                                    value={followUpForm.date}
                                    onChange={e => setFollowUpForm(f => ({ ...f, date: e.target.value }))}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                                <div className="mb-6">
                                  <label className="block text-sm font-medium mb-2">Conclusion</label>
                                  <textarea
                                    value={followUpForm.conclusion}
                                    onChange={e => setFollowUpForm(f => ({ ...f, conclusion: e.target.value }))}
                                    placeholder="Add any relevant notes here..."
                                    className="w-full border border-gray-300 rounded-md px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    required
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md shadow-md transition"
                                >
                                  Submit
                                </button>
                              </form>
                            </div>
                          </div>
                        )}

                        {/* End Conversation Dialog */}
                        {showEndConvoDialog && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                            <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-lg mx-auto p-6 md:p-8">
                              <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">End Conversation</h3>
                                <button
                                  onClick={() => {
                                    setShowEndConvoDialog(false);
                                    loadLeads();
                                    setEndConvoForm({ type: 'positive', conclusion: '' });
                                  }}
                                  className="text-gray-500 hover:text-red-500 transition"
                                >
                                  <X size={24} />
                                </button>
                              </div>
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  try {
                                    console.log("End Conversation Form Data:", endConvoForm);
                                    const isProfitable = endConvoForm.type === 'positive';
                                    await axios.put(`/lead/endconvo/${activeLeadId}`, {
                                      isProfitable,
                                      conclusion: endConvoForm.conclusion,
                                    });
                                    toast.success('Conversation ended successfully!');
                                    setShowEndConvoDialog(false);
                                    loadLeads();
                                    setEndConvoForm({ type: 'positive', conclusion: '' });
                                  } catch (err: any) {
                                    toast.error(err?.response?.data?.error.message || 'Failed to end conversation.');
                                  }
                                }}
                              >
                                <div className="mb-5">
                                  <label className="block text-sm font-medium mb-2">Type</label>
                                  <div className="flex gap-6">
                                    {['positive', 'negative'].map((type) => (
                                      <label key={type} className="flex items-center gap-2 text-sm">
                                        <input
                                          type="radio"
                                          name="type"
                                          value={type}
                                          checked={endConvoForm.type === type}
                                          onChange={() => setEndConvoForm(f => ({ ...f, type }))}
                                          className="accent-blue-600"
                                        />
                                        <span className="capitalize">{type}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div className="mb-6">
                                  <label className="block text-sm font-medium mb-2">Conclusion</label>
                                  <textarea
                                    value={endConvoForm.conclusion}
                                    onChange={e => setEndConvoForm(f => ({ ...f, conclusion: e.target.value }))}
                                    placeholder="Add any relevant notes here..."
                                    className="w-full border border-gray-300 rounded-md px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                    required
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-md shadow-md transition"
                                >
                                  Submit
                                </button>
                              </form>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleViewLeadDetails(lead.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="View Lead Details"
                        >
                          <Eye size={18} />
                        </button>

                        <button onClick={() => editlead(lead.id)} className="text-gray-400 hover:text-yellow-600 transition-colors cursor-pointer">
                          <Edit size={18} />
                        </button>
                        {!isWorker && (
                          <button
                            onClick={() => handleDeleteClick(lead.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Email:</span> {lead.contact.email}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span> {lead.contact.phone}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">Status:</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">Priority:</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">{NoCatOnlyAssign ? 'Category:' : 'Assigned To:'}</span> {NoCatOnlyAssign ? (lead.category || 'Un-Categorized') : (lead?.assignedTo?.name || 'Unassigned')}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Last Contact:</span> {lead.lastContact}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No leads found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this lead? This action cannot be undone."
      />

      {/* Lead Details Dialog */}
      <LeadDetailsDialog
        isOpen={showLeadDetails}
        onClose={() => {
          setShowLeadDetails(false);
          setSelectedLeadDetails(null);
        }}
        leadData={selectedLeadDetails}
      />
    </div>
  );
}

export default App;