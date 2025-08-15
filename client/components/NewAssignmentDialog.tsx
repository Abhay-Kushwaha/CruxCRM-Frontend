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
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { loadComponents } from "next/dist/server/load-components";

interface Category {
  _id: string;
  title: string;
}

interface Worker {
  _id: string;
  name: string;
}

interface Lead {
  id: string;
  name: string;
  position: string;
  category: string;
  color: string;
}

export default function NewAssignmentDialog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    priority: "",
    worker: "",
    dueDate: "",
    notes: "",
  });
  const [mobileView, setMobileView] = useState<"leads" | "form">("leads");
  const [categoryFilter, setCategoryFilter] = useState(""); // NEW

  // Fetch categories, workers, and unassigned leads when dialog opens
  useEffect(() => {
    if (open) {
      axios.get("/category").then((res) => {
        if (Array.isArray(res.data.data)) setCategories(res.data.data);
      });
      axios.get("/worker/get-all-workers").then((res) => {
        if (Array.isArray(res.data.data)) setWorkers(res.data.data);
      });
      axios.get("/lead/leads").then((res) => {
        const data = res.data?.data || [];
        const mappedLeads = data
          .filter(
            (lead: any) =>
              !lead.assignedTo
          )
          .map((lead: any) => ({
            id: lead._id,
            name: lead.name,
            position: lead.position || "",
            category: lead.category?.title || "",
            color: lead.category?.color || "black",
          }));
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

  const handlePriority = (value: string) =>
    setForm({ ...form, priority: value });

  const handleWorker = (value: string) =>
    setForm({ ...form, worker: value });

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

  // Submit assignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (form.worker || form.category || selectedLeadIds.length === 0) {
    //   toast.error("Please select worker, category, and at least one lead.");
    //   return;
    // }
    console.log("bhai ya form ha >>", selectedLeadIds, form);
    try {
      await axios.post("lead/assign", {
        leadIds: selectedLeadIds,
        assignedTo: form.worker,
        priority: form.priority.toLowerCase(),
        dueDate: form.dueDate,
        notes: form.notes,
      });


      toast.success("Leads assigned successfully!");
      setOpen(false);
      setForm({
        priority: "medium",
        worker: "",
        dueDate: "",
        notes: "",
      });
      setSelectedLeadIds([]);
    } catch (err: any) {
      console.log("error:>>", err?.response?.data.error.message);

      toast.error(err?.response?.data.error.message || "Failed to assign leads.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}  >
      <DialogTrigger asChild>
        <Button className="absolute top-4 right-4 bg-gray-800 hover:bg-black text-white shadow-lg cursor-pointer px-6 py-2 rounded-lg">
          + New Assignment
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white h-[95vh] dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-1 overflow-hidden">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 p-6 ">
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight text-center">
            Assign Leads
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[70vh]">
          {/* Left Panel - Category Filter & Leads Selection */}
          <div
            className={`${mobileView === "leads" ? "block" : "hidden"
              } md:block border-r border-gray-200 dark:border-gray-700 w-full md:w-2/3 p-4 overflow-auto`}
          >
            {/* Category Filter Dropdown */}
            <div className="mb-4">
              <label
                htmlFor="categoryFilter"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Filter by Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600">
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

            <div className="sticky top-0 bg-white mt-0 dark:bg-gray-900 z-10 pb-3">
              <div className="flex justify-between items-center py-2 mb-3">
                <h3 className="font-medium text-gray-800 dark:text-white">
                  Unassigned Leads
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs mr-4 text-gray-500">
                    {selectedLeadIds.length} selected
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs h-8 px-3"
                  >
                    {selectedLeadIds.length === filteredLeads.length ? (
                      <>
                        <CheckCheck className="h-3 w-3 mr-1.5 text-green-500" />
                        <span className="text-sm">Unselect All</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1.5 text-green-500 " />
                        <span className="text-sm">Select All</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2">
              {filteredLeads.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {leads.length === 0
                    ? "No unassigned leads available."
                    : "No matching leads found."}
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLeads.map((lead) => (
                    <li
                      key={lead.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <label className="flex items-center px-3 py-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.includes(lead.id)}
                          onChange={() => handleLeadCheckbox(lead.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {lead.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {lead.position || "No position specified"}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className="text-xs p-1 rounded-[50%] w-2 h-2 truncate text-gray-800 dark:text-white"
                              style={{ backgroundColor: lead.color || "#222" }}
                            >
                            </span>
                            <p className="text-sm">{lead.category || "No category specified"}</p>
                          </div>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Mobile view toggle buttons */}
          <div className="md:hidden flex border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMobileView("leads")}
              className={`flex-1 py-3 flex items-center justify-center space-x-2 ${mobileView === "leads" ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
            >
              <PanelLeft className="h-4 w-4" />
              <span>Leads</span>
            </button>
            <button
              onClick={() => setMobileView("form")}
              className={`flex-1 py-3 flex items-center justify-center space-x-2 ${mobileView === "form" ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
            >
              <PanelRight className="h-4 w-4" />
              <span>Assignment</span>
            </button>
          </div>

          {/* Right Panel - Assignment Form */}
          <div
            className={`${mobileView === "form" ? "block" : "hidden"
              } md:block w-full md:w-2/3 p-6 overflow-auto`}
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Selected Leads Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                  Selected Leads: {selectedLeadIds.length}
                </h4>
                {selectedLeadIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {leads
                      .filter((lead) => selectedLeadIds.includes(lead.id))
                      .slice(0, 3) // Show only first 3 for space
                      .map((lead) => (
                        <span
                          key={lead.id}
                          className="text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                        >
                          {lead.name}
                        </span>
                      ))}
                    {selectedLeadIds.length > 3 && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        +{selectedLeadIds.length - 3} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No leads selected
                  </p>
                )}
              </div>

              {/* Worker Dropdown */}
              <div>
                <label
                  htmlFor="assignTo"
                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                >
                  Assign To<span className="text-red-500"> *</span>
                </label>
                <Select value={form.worker} onValueChange={handleWorker}>
                  <SelectTrigger className="dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select Worker" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white">
                    {workers.map((worker) => (
                      <SelectItem key={worker._id} value={worker._id}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Priority<span className="text-red-500"> *</span>
                  </label>
                  <Select value={form.priority || ""} onValueChange={handlePriority}>
                    <SelectTrigger className="dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-white">
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Due Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!form.dueDate ? "text-muted-foreground" : ""}`}
                      >
                        {form.dueDate
                          ? format(new Date(form.dueDate), "PPP")
                          : "Pick a due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.dueDate ? new Date(form.dueDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleChange({
                              target: {
                                name: "dueDate",
                                value: format(date, "yyyy-MM-dd"),
                              },
                            } as React.ChangeEvent<HTMLInputElement>);
                          }
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                >
                  Notes
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add any relevant notes here..."
                  className="dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-md shadow-lg transition-all duration-200 ease-in-out cursor-pointer"
              >
                Assign{" "}
                {selectedLeadIds.length > 0
                  ? `(${selectedLeadIds.length})`
                  : ""}{" "}
                Leads
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
