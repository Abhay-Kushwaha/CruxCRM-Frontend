"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "@/lib/Axios";
import {
  Search,
  Check,
  CheckCheck,
  X,
  PanelLeft,
  PanelRight,
  Mail,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";

interface Category {
  _id: string;
  title: string;
}

interface Lead {
  id: string;
  name: string;
  position: string;
  category: string;
  color: string;
}

export default function NewCampaignDialog() {
  const [loginuser, setUser] = useState<{ name: string; role: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    campaignTitle: "",
    category: "",
    messageType: "email",
    emailSubject: "",
    emailContent: "",
  });
  const [mobileView, setMobileView] = useState<"leads" | "form">("leads");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories and unassigned leads when dialog opens
  useEffect(() => {
    if (open) {
      axios.get("/category").then((res) => {
        if (Array.isArray(res.data.data)) setCategories(res.data.data);
      });

      axios.get("/lead/leads").then((res) => {
        const data = res.data?.data || [];
        const mappedLeads = data
      .map((lead: any) => ({
            id: lead._id,
            name: lead.name,
            position: lead.position || "",
            category: lead.category?.title || "",
            color: lead.category?.color || "#6366f1",
          }));
          console.log("Dialog opened, fetching categories and leads",data);
        setLeads(mappedLeads);
      });
    }
    
  }, [open]);

  // Filter leads based on search term and category
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter(
        (lead) =>
          lead.category ===
          categories.find((cat) => cat._id === categoryFilter)?.title
      );
    }
    return result.filter(
      (lead) =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm, categoryFilter, categories]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectChange = (name: string, value: string) =>
    setForm({ ...form, [name]: value });

  // Handle lead checkbox selection
  const handleLeadCheckbox = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Select all leads
  const handleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((lead) => lead.id));
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Reset form
  const resetForm = () => {
    setForm({
      campaignTitle: "",
      category: "",
      messageType: "email",
      emailSubject: "",
      emailContent: "",
    });
    setSelectedLeadIds([]);
    setSearchTerm("");
    setCategoryFilter("");
  };

  // Submit campaign
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.campaignTitle.trim()) {
      toast.error("Please enter a campaign title.");
      return;
    }

    if (!form.category.trim()) {
      toast.error("Please enter a category.");
      return;
    }

    if (selectedLeadIds.length === 0) {
      toast.error("Please select at least one lead.");
      return;
    }

    if (form.messageType === "email") {
      if (!form.emailSubject.trim()) {
        toast.error("Please enter an email subject.");
        return;
      }
      if (!form.emailContent.trim()) {
        toast.error("Please enter email content.");
        return;
      }
    }

    setIsSubmitting(true);
    console.log("Submitting campaign with form data:", form);
    
    try {
      // Map form state to the required API payload
      await axios.get("/user/current").then((res) => {
        const user = res.data.data;
        if (!user) {
          throw new Error("User not found");
        }
        console.log("Current user data:", user.name);
        
        setUser(user.name);
      });
      const payload = {
        leadIds: selectedLeadIds,
        title: form.campaignTitle,
        subject: form.emailSubject,
        description: form.emailContent,
        type: form.messageType === "email" ? "mail" : "sms",
        category: form.category,
        createdBy:loginuser
      };

      // Use the new API endpoint
      await axios.post("/campaign/create", payload);

      toast.success("Campaign created successfully!");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      console.log("Campaign creation error:", err);
      toast.error(err?.response?.data?.message || "Failed to create campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className=" bg-gradient-to-r flex items-center justify-center from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg cursor-pointer px-6 w-48 h-12 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105">
          <Send className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white h-[95vh] dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-0 overflow-hidden max-w-6xl">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight text-center flex items-center justify-center">
            <Mail className="h-6 w-6 mr-2 text-blue-600" />
            Create Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="flex  flex-col md:flex-row h-[calc(95vh-100px)]">
          {/* Left Panel - Category Filter & Leads Selection */}
          <div
            className={`${
              mobileView === "leads" ? "block" : "hidden"
            } md:block border-r border-gray-200 dark:border-gray-700 w-full md:w-3/5 p-6 overflow-auto bg-gray-50/50 dark:bg-gray-800/50`}
          >
            {/* Category Filter Dropdown */}
            <div className="mb-6">
              <label
                htmlFor="categoryFilter"
                className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
              >
                Filter by Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 h-11">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sticky top-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 pb-4 mb-4 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Select Leads
                </h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                    {selectedLeadIds.length} selected
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs h-9 px-4 hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    {selectedLeadIds.length === filteredLeads.length ? (
                      <>
                        <CheckCheck className="h-4 w-4 mr-1.5 text-green-600" />
                        Unselect All
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1.5 text-green-600" />
                        Select All
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search leads by name or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2">
              {filteredLeads.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg font-medium mb-2">No leads found</p>
                  <p className="text-sm">
                    {leads.length === 0
                      ? "No unassigned leads available."
                      : "Try adjusting your search or category filter."}
                  </p>
                </div>
              ) : (
               <div className="space-y-2">
  {filteredLeads.map((lead) => (
    <div
      key={lead.id}
      className={`bg-white dark:bg-gray-900 rounded-lg border transition-all duration-200 ${
        selectedLeadIds.includes(lead.id)
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <label className="flex items-center p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={selectedLeadIds.includes(lead.id)}
          // --- THIS IS THE LINE TO FIX ---
          onChange={() => handleLeadCheckbox(lead.id)} 
          // -----------------------------
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <div className="ml-4 flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {lead.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
            {lead.position || "No position specified"}
          </p>
          <div className="flex items-center mt-2">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: lead.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {lead.category || "No category"}
            </span>
          </div>
        </div>
      </label>
    </div>
  ))}
</div>
              )}
            </div>
          </div>

          {/* Mobile view toggle buttons */}
          <div className="md:hidden flex border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setMobileView("leads")}
              className={`flex-1 py-3 flex items-center justify-center space-x-2 transition-colors ${
                mobileView === "leads"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <PanelLeft className="h-4 w-4" />
              <span className="font-medium">Leads</span>
            </button>
            <button
              onClick={() => setMobileView("form")}
              className={`flex-1 py-3 flex items-center justify-center space-x-2 transition-colors ${
                mobileView === "form"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <PanelRight className="h-4 w-4" />
              <span className="font-medium">Campaign</span>
            </button>
          </div>

          {/* Right Panel - Campaign Form */}
          <div
            className={`${
              mobileView === "form" ? "block" : "hidden"
            } md:block w-full md:w-2/5 p-6 overflow-auto bg-white dark:bg-gray-900`}
          >
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                  Campaign Details
                </h3>
              </div>

              {/* Campaign Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Campaign Title
                </label>
                <Input
                  type="text"
                  name="campaignTitle"
                  value={form.campaignTitle}
                  onChange={handleChange}
                  placeholder="Enter campaign title"
                  className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <Input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Enter campaign category (e.g., Marketing)"
                  className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  required
                />
              </div>

              {/* Message Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Message Type
                </label>
                <Select
                  value={form.messageType}
                  onValueChange={(value) =>
                    handleSelectChange("messageType", value)
                  }
                >
                  <SelectTrigger className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800">
                    <SelectItem value="email">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="message">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Subject - Only show for email type */}
              {form.messageType === "email" && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email Subject
                  </label>
                  <Input
                    type="text"
                    name="emailSubject"
                    value={form.emailSubject}
                    onChange={handleChange}
                    placeholder="Enter email subject"
                    className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    required
                  />
                </div>
              )}

              {/* Email Content */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {form.messageType === "email"
                    ? "Email Content"
                    : "Message Content"}
                </label>
                <Textarea
                  name="emailContent"
                  value={form.emailContent}
                  onChange={handleChange}
                  placeholder={`Enter ${form.messageType} content`}
                  rows={8}
                  className="h-40 resize-none bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 h-11 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}