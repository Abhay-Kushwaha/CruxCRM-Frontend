"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Edit, Trash2, User, Building, Phone, ChevronDown, ChevronUp, X } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar, Calendar as DatePicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import axios from '@/lib/Axios';
import { toast } from 'sonner';

// --- TypeScript Interfaces ---
interface Category {
  _id: string;
  title: string;
  color: string;
}

interface Worker {
  _id: string;
  name: string;
  email: string;
}

interface Conversation {
  id: string;
  leadName: string | null;
  workerName: string | null;
  managerName: string | null;
  category: string | null;
  categoryColor: string;
  followupDate: string;
  conclusion: string | null;
  status: 'new' | 'in-progress' | 'follow-up' | 'closed';
  conversationEnd: 'positive' | 'negative' | 'not confirmed';
  createdAt: string;
}

interface ApiResponse {
  conversation: {
    _id: string;
    date: string;
    conclusion: string;
    isProfitable: boolean | null;
    addedBy: string;
    isDeleted: boolean;
    lead: string;
    __v: number;
  };
  meta: {
    leadName: string;
    followupDate: string[];
    status: 'new' | 'in-progress' | 'follow-up' | 'closed';
    workerName?: string;
    managerName?: string;
    categoryTitle: string;
    categoryColor: string;
  };
}

const ConversationComponent = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [workerFilter, setWorkerFilter] = useState<string>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [hideSelect, setHideSelect] = useState(false);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const checkCookies = () => {
      const cookies = document.cookie.split(";").map(cookie => cookie.trim());
      const has001Cookie = cookies.some(cookie => cookie.startsWith("001"));
      setHideSelect(has001Cookie);
    };
    checkCookies();
  }, []);
  const cookies = document.cookie.split(";").map(cookie => cookie.trim());
  const has001Cookie = cookies.some(cookie => cookie.startsWith("001"));

  // In real implementation, you would fetch data like this:
  useEffect(() => {
    // Fetch categories
    axios.get("/category").then((res) => {
      if (Array.isArray(res.data.data)) setCategories(res.data.data as Category[]);
      console.log("Category: ", res.data.data);
    });

    // Fetch workers
    {
      !has001Cookie && axios.get("/worker/get-all-workers").then((res) => {
        if (Array.isArray(res.data.data)) setWorkers(res.data.data as Worker[]);
        console.log("All Worker: ", res.data.data);
      });
    }

    // Fetch conversations
    fetchConversations();
  }, []);

  // Mapping fetched conversations
  const fetchConversations = async () => {
    try {
      const response = await axios.get<{ data: ApiResponse[] }>('/conversation');
      console.log("Conversations response:", response.data);
      const mapped: Conversation[] = response.data.data.map((item) => ({
        id: item.conversation._id,
        leadName: item.meta.leadName || null,
        workerName: item.meta.workerName || null,
        managerName: item.meta.managerName || null,
        category: item.meta.categoryTitle || null,
        categoryColor: item.meta.categoryColor,
        followupDate: item?.conversation?.date
          ? new Date(item.conversation.date).toISOString().split('T')[0]
          : "No follow-up date",
        conclusion: item.conversation.conclusion || null,
        status: item.conversation.isProfitable !== null ? item.meta.status : 'follow-up',
        conversationEnd: item.conversation.isProfitable === true
          ? "positive"
          : item.conversation.isProfitable === false
            ? "negative"
            : "not confirmed",
        createdAt: item.conversation.date,
      }));
      setConversations(mapped);
      console.log("Conversations fetched:", mapped);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = useMemo(() => {
    let result: Conversation[] = conversations;

    // Filter by category
    if (categoryFilter && categoryFilter !== 'all') {
      const selectedCategory = categories.find(cat => cat._id === categoryFilter);
      result = result.filter(conv => conv.category === selectedCategory?.title);
    }

    // Date filter with proper formatting
    if (dateFilter) {
      const filterDate = format(dateFilter, 'PPP');
      result = result.filter(conv => conv.followupDate === filterDate);
    }

    // Filter by worker
    if (workerFilter && workerFilter !== 'all') {
      const selectedWorker = workers.find(worker => worker._id === workerFilter);
      result = result.filter(conv => conv.workerName === selectedWorker?.name);
    }

    // Filter by search term with null checks
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(conv => {
        const leadName = conv.leadName?.toLowerCase() || '';
        const workerName = conv.workerName?.toLowerCase() || '';
        const category = conv.category?.toLowerCase() || '';
        const conclusion = conv.conclusion?.toLowerCase() || '';

        return leadName.includes(search) ||
          workerName.includes(search) ||
          category.includes(search) ||
          conclusion.includes(search);
      });
    }

    // Date filter
    if (dateFilter) {
      const filterDate = format(dateFilter, 'yyyy-MM-dd');
      result = result.filter(conv => conv.followupDate === filterDate);
    }

    return result;
  }, [conversations, searchTerm, categoryFilter, workerFilter, dateFilter, categories, workers]);

  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUpdate = (conversation: Conversation) => {
    setEditingConversation(conversation);
    setUpdateDialogOpen(true);
  };

  const handleDelete = (conversation: Conversation) => {
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };

  const confirmUpdate = () => {
    if (editingConversation) {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === editingConversation.id ? editingConversation : conv
        )
      );
      const isProfitable = editingConversation.conversationEnd === 'positive'
        ? true
        : editingConversation.conversationEnd === 'negative'
          ? false
          : null;
      // Prepare the update payload
      const updatePayload = {
        followupDate: editingConversation.followupDate,
        conclusion: editingConversation.conclusion,
        isProfitable
      };
      console.log("Updated content: ", updatePayload)
      axios.put(`/conversation/update/${editingConversation.id}`, updatePayload)
        .then(() => {
          setEditingConversation(null);
          setUpdateDialogOpen(false);
          toast.success("Conversation updated successfully");
          fetchConversations();
        })
        .catch(err => {
          console.error("Error updating conversation:", err);
          toast.error("Failed to update conversation");
          fetchConversations();
        });
    }
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      setConversations(prev =>
        prev.filter(conv => conv.id !== conversationToDelete.id)
      );
      axios.delete(`/conversation/delete/${conversationToDelete.id}`)
        .then(() => {
          setConversationToDelete(null);
          setDeleteDialogOpen(false);
          toast.success("Conversation deleted successfully");
        })
        .catch(err => {
          console.error("Error deleting conversation:", err);
          toast.error("Failed to delete conversation");
        });
    }
  };

  const getStatusColor = (status: Conversation['status']) => {
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

  const getConversationEndColor = (end: Conversation['conversationEnd']) => {
    switch (end.toLowerCase()) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'not confirmed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Conversation Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track all lead conversations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by lead name, worker, category, or conclusion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Worker Filter */}
              {!hideSelect && (
                <Select value={workerFilter} onValueChange={setWorkerFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by worker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workers</SelectItem>
                    {workers.map(worker => (
                      <SelectItem key={worker._id} value={worker._id}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : <span>Filter by follow-up date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DatePicker
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {dateFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDateFilter(undefined)}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear date filter</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Conversations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredConversations.map(conversation => (
            <Card key={conversation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 dark:text-white mb-2">
                      Lead: {conversation.leadName}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <User className="h-4 w-4" />
                      {conversation.workerName != 'N/A' ?
                        <span>Worker: {conversation.workerName}</span>
                        : <span>Manager: {conversation.managerName}</span>}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: conversation.categoryColor }}
                      />
                      <span className="text-sm font-medium">{conversation.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdate(conversation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(conversation)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Status and Conversation End */}
                  <div className="flex flex-wrap justify-between text-sm">
                    <span className='text-sm'>Status: <Badge className={getStatusColor(conversation.status)}>
                      {conversation.status}
                    </Badge>
                    </span>
                    <span className='text-sm'>Was Profitable: <Badge className={getConversationEndColor(conversation.conversationEnd)}>
                      {conversation.conversationEnd}
                    </Badge>
                    </span>
                  </div>

                  {/* Follow-up Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      Follow-up: {conversation.followupDate}
                    </span>
                  </div>

                  {/* Conclusion */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-h-3/4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Conclusion:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-h-150 overflow-hidden text-wrap">
                      {expandedCards[conversation.id]
                        ? conversation.conclusion
                        : truncateText(conversation.conclusion !== null ? conversation.conclusion : 'No conclusion provided')
                      }
                    </p>
                    {conversation.conclusion !== null && conversation.conclusion.length > 150 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => toggleCardExpansion(conversation.id)}
                        className="mt-2 p-0 h-auto text-blue-600 dark:text-blue-400"
                      >
                        {expandedCards[conversation.id] ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            <span className="text-sm -ml-1">See less</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            <span className="text-sm -ml-1">See more</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredConversations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No conversations found matching your criteria.</p>
          </div>
        )}

        {/* Update Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent className="w-full sm:w-1/2 md:w-1/3">
            <DialogHeader>
              <DialogTitle>Update Conversation</DialogTitle>
            </DialogHeader>
            {editingConversation && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="followupDate" className='mb-2'>Follow-up Date</Label>
                  <Input
                    id="followupDate"
                    type="datetime-local"
                    value={editingConversation.followupDate ?
                      new Date(editingConversation.followupDate).toISOString().slice(0, 16) :
                      ''
                    }
                    onChange={(e) => setEditingConversation({
                      ...editingConversation,
                      followupDate: e.target.value ?
                        format(new Date(e.target.value), 'PPP') :
                        'Not scheduled'
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="conclusion" className='mb-2'>Conclusion</Label>
                  <Textarea
                    id="conclusion"
                    value={editingConversation.conclusion !== null ? editingConversation.conclusion : ''}
                    onChange={(e) => setEditingConversation({
                      ...editingConversation,
                      conclusion: e.target.value
                    })}
                    rows={4}
                    className='h-45 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <Label htmlFor="conversationEnd" className='mb-2'>Conversation End</Label>
                  <Select
                    value={editingConversation.conversationEnd}
                    onValueChange={(value: Conversation['conversationEnd']) => setEditingConversation({
                      ...editingConversation,
                      conversationEnd: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="not confirmed">Not Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={confirmUpdate}>
                    Update Conversation
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the conversation
                with {conversationToDelete?.leadName}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ConversationComponent;