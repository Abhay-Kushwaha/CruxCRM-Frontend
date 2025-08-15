"use client";

import { useState, useRef, useEffect, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, ArrowRight, FileText, X, Loader2, Check, Building, Target, Users } from "lucide-react";
import { usePathname } from "next/navigation";
// import AdditionalInfoSection from "../../../../../components/AdditionalInfoSection";
import AdditionalInfoSection from "@/../components/AdditionalInfoSection";
import BusinessInfoSection from "@/../components/BusinessInfoSection";
import ContactInfoSection from "@/../components/ContactInfoSection";
import Axios from "@/lib/Axios";

// TypeScript interfaces
interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  category: string;
  position: string;
  leadSource: string;
  notes: string;
  priority: "high" | "medium" | "low";
  lastContact: string;
  documents: File | null;
}

interface FormErrors {
  [key: string]: string;
}

type PriorityType = "high" | "medium" | "low";

// API response structure
interface LeadApiResponse {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  category: string | { id: string; title: string };
  position?: string;
  leadSource?: string;
  notes?: string;
  priority: "high" | "medium" | "low";
  lastContact: string;
  documents?: string[];
  campaignSent?: string[];
  conversations?: string[];
  isDeleted: boolean;
  createdAt: string;
}
// TypeScript interfaces
interface Category {
  _id: string;
  title: string;
  description: string;
  color: string;
  createdAt: string;
  __v: number;
}

export default function UpdateLeadForm(): JSX.Element {
  const pathname = usePathname();
  const leadId = pathname.split("/").pop();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phoneNumber: "",
    category: "",
    position: "",
    leadSource: "",
    notes: "",
    priority: "medium",
    documents: null,
    lastContact: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingLead, setIsFetchingLead] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch lead data
  const fetchLeadData = async (id: string) => {
    setIsFetchingLead(true);
    setErrors({});
    if (!id) {
      setErrors({ submit: "No lead ID found" });
      setIsFetchingLead(false);
      return;
    }
    try {
      const response = await Axios.get(`/lead/getlead/${id}`);

      if (response.data.success && response.data.data) {
        const leadData: LeadApiResponse = response.data.data;
        console.log("Fetched Lead Data:", leadData);

        // Format date for datetime-local input
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
          } catch {
            return "";
          }
        };

        // Populate form with fetched data
        setFormData(prev => ({
          ...prev,
          name: leadData.name || "",
          email: leadData.email || "",
          phoneNumber: leadData.phoneNumber?.toString() || "",
          category:
            typeof leadData.category === "object"
              ? leadData.category.id
              : leadData.category || "",
          position: leadData.position || "",
          leadSource: leadData.leadSource || "",
          notes: leadData.notes || "",
          priority: leadData.priority || "medium",
          lastContact: formatDateForInput(leadData.lastContact),
          documents: null,
        }));
      } else {
        setErrors({ submit: "Failed to fetch lead data" });
      }
    } catch (error: any) {
      console.error("Error fetching lead data:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to fetch lead data",
      });
    } finally {
      setIsFetchingLead(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async (): Promise<void> => {
    setLoadingCategories(true);
    try {
      const response = await Axios.get("/category/");
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      } else {
        console.error("API response structure unexpected:", response.data);
        setErrors((prev) => ({
          ...prev,
          categories: "Failed to load categories. Please refresh the page.",
        }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setErrors((prev) => ({
        ...prev,
        categories: "Failed to load categories. Please refresh the page.",
      }));
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch lead data on component mount
  useEffect(() => {
    if (leadId) {
      fetchLeadData(leadId);
    } else {
      setErrors({ submit: "No lead ID provided" });
      setIsFetchingLead(false);
    }
    fetchCategories(); // Fetch categories when component mounts
  }, [leadId]);

  // Animation on mount
  useEffect(() => {
    if (formRef.current) {
      formRef.current.style.opacity = "0";
      formRef.current.style.transform = "translateY(20px)";
      const timer = setTimeout(() => {
        if (formRef.current) {
          formRef.current.style.opacity = "1";
          formRef.current.style.transform = "translateY(0)";
          formRef.current.style.transition =
            "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (
      formData.phoneNumber &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;

    // Don't allow email changes (as per your original code)
    if (name === "email") return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Fix type for handleSelectChange (line 621)
  const handleSelectChange = (field: string, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user selects
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          documents: "File size must be less than 5MB",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        documents: file,
      }));

      // Clear error
      if (errors.documents) {
        setErrors((prev) => ({
          ...prev,
          documents: "",
        }));
      }
    }
  };

  // Remove uploaded file
  const removeFile = (): void => {
    setFormData((prev) => ({
      ...prev,
      documents: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"], [id="${firstErrorField}"]`
      ) as HTMLElement; // Added ID for select fields
      if (errorElement) {
        errorElement.focus();
      }
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare form data for submission
      const submitFormData = new FormData();

      // Add all form fields including category
      submitFormData.append("name", formData.name);
      submitFormData.append("phoneNumber", formData.phoneNumber);
      submitFormData.append("category", formData.category);
      submitFormData.append("position", formData.position);
      submitFormData.append("leadSource", formData.leadSource);
      submitFormData.append("notes", formData.notes);
      submitFormData.append("priority", formData.priority);

      // Convert lastContact to ISO string if provided
      if (formData.lastContact) {
        submitFormData.append(
          "lastContact",
          new Date(formData.lastContact).toISOString()
        );
      }

      // Add document if it exists
      if (formData.documents) {
        submitFormData.append("documents", formData.documents);
      }
      console.log("Form Data Entries:", Array.from(submitFormData.entries()));

      // Make API call
      const response = await Axios.put(
        `/lead/updateleads/${leadId}`,
        submitFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);

        // Success animation
        if (cardRef.current) {
          cardRef.current.style.transform = "scale(1.02)";
          cardRef.current.style.transition = "transform 0.2s ease-out";
          setTimeout(() => {
            if (cardRef.current) {
              cardRef.current.style.transform = "scale(1)";
            }
          }, 200);
        }

        // Reset success state after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          window.location.replace("/leads/all-leads");
        }, 3000);
      } else {
        setErrors({ submit: response.data.message || "Failed to update lead" });
      }
    } catch (error: any) {
      console.error("Error updating lead:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Failed to update lead. Please try again....",
      });

      // Error animation
      if (cardRef.current) {
        cardRef.current.style.animation = "shake 0.6s ease-in-out";
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.animation = "";
          }
        }, 600);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Priority icon component
  const PriorityIcon = ({
    priority,
  }: {
    priority: PriorityType;
  }): JSX.Element => {
    switch (priority) {
      case "high":
        return <ArrowUp className="w-4 h-4 text-red-500" />;
      case "medium":
        return <ArrowRight className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <ArrowDown className="w-4 h-4 text-green-500" />;
      default:
        return <ArrowRight className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Priority badge component
  const PriorityBadge = ({
    priority,
  }: {
    priority: PriorityType;
  }): JSX.Element => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };

    return (
      <Badge variant="outline" className={`${colors[priority]} capitalize`}>
        <PriorityIcon priority={priority} />
        <span className="ml-1">{priority}</span>
      </Badge>
    );
  };

  // Loading state
  if (isFetchingLead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-700">
            Loading lead data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
      `}</style>
      <div
        ref={formRef}
        className="min-h-screen bg-gradient-to-br py-6 sm:py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Stats Card */}
              <Card className="bg-white/90 dark:bg-[#232b3e] backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                    <Target className="w-5 h-5 text-blue-600" />
                    Lead Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">New Leads</span>
                    <Badge variant="secondary" className="dark:bg-blue-900/50 dark:text-blue-200">24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress</span>
                    <Badge variant="secondary" className="dark:bg-blue-900/50 dark:text-blue-200">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Converted</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">8</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-[#232b3e] dark:to-[#1a2236] border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[100px]">High Priority:</span>
                      <span>Follow up within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[100px]">Lead Source:</span>
                      <span>Track where your best leads come from</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[100px]">Documentation:</span>
                      <span>Upload relevant files for context</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[100px]">Notes:</span>
                      <span>Add detailed information for better follow-up</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-3">
              <Card
                ref={cardRef}
                className={`bg-white/95 dark:bg-[#1a2236] backdrop-blur-sm border-0 shadow-2xl transition-all duration-300 ${success ? "ring-2 ring-green-500 ring-opacity-50" : ""
                  }`}
              >
                <CardHeader className="border-b rounded-t-2xl border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-[#232b3e] pt-7">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building className="w-6 h-6 text-blue-600" />
                        Update Lead
                        {leadId && (
                          <span className="text-gray-500 dark:text-gray-300 text-base">
                            (ID: {leadId ? leadId.slice(-8) + "..." : ""})
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
                        Modify the details of an existing prospect in your sales
                        pipeline.
                      </CardDescription>
                    </div>
                    <PriorityBadge priority={formData.priority} />
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Success Message */}
                    {success && (
                      <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-200" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">
                            Lead updated successfully!
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-200">
                            Your changes have been saved.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {errors.submit && (
                      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center gap-3">
                        <X className="w-5 h-5 text-red-600 dark:text-red-200" />
                        <p className="font-medium text-red-800 dark:text-red-200">
                          {errors.submit}
                        </p>
                      </div>
                    )}

                    {/* Form Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <ContactInfoSection
                        formData={formData}
                        errors={errors}
                        isLoading={isLoading}
                        handleInputChange={handleInputChange}
                      />
                      <BusinessInfoSection
                        formData={formData}
                        categories={categories}
                        loadingCategories={loadingCategories}
                        errors={errors}
                        isLoading={isLoading}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                        fetchCategories={fetchCategories}
                      />
                      <AdditionalInfoSection
                        formData={formData}
                        errors={errors}
                        isLoading={isLoading}
                        handleSelectChange={handleSelectChange}
                        handleInputChange={handleInputChange}
                        handleFileChange={handleFileChange}
                        removeFile={removeFile}
                        fileInputRef={fileInputRef}
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10 pt-4 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={isLoading}
                        onClick={() => window.history.back()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        disabled={isLoading || success}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        ) : success ? (
                          <div className="flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>Updated!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>Update Lead</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}