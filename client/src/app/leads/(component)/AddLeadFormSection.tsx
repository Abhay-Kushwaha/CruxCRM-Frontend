import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  X,
  Loader2,
  Check,
  Building,
} from "lucide-react";

// Use the same types as your main page
interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  category: string;
  position: string;
  leadSource: string;
  notes: string;
  status: "new" | "in-progress" | "follow-up" | "closed";
  priority: "high" | "medium" | "low";
  followUpDates: string[];
  lastContact: string;
  documents: File | null;
}
interface FormErrors {
  [key: string]: string;
}
interface Category {
  _id: string;
  title: string;
}

export interface AddLeadFormSectionProps {
  formData: FormData;
  errors: FormErrors;
  categories: Category[];
  loadingCategories: boolean;
  isLoading: boolean;
  success: boolean;
  cardRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
  handleFollowUpDatesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  fetchCategories: () => void;
  PriorityBadge: React.FC<{ priority: string }>;
  PriorityIcon: React.FC<{ priority: string }>;
  leadId?: string;
}

const AddLeadFormSection: React.FC<AddLeadFormSectionProps> = ({
  formData,
  errors,
  categories,
  loadingCategories,
  isLoading,
  success,
  cardRef,
  fileInputRef,
  handleInputChange,
  handleSelectChange,
  handleFileChange,
  removeFile,
  handleFollowUpDatesChange,
  handleSubmit,
  PriorityBadge,
}) => {
  // Format follow-up dates for display
  const formatFollowUpDatesForDisplay = () => {
    return formData.followUpDates
      .map((dateStr: string) => {
        try {
          return new Date(dateStr).toISOString().slice(0, 10);
        } catch {
          return dateStr;
        }
      })
      .join(", ");
  };

  const safeFormData = formData || {
    name: "",
    email: "",
    phoneNumber: "",
    category: "",
    position: "",
    leadSource: "",
    notes: "",
    status: "new",
    priority: "medium",
    followUpDates: [],
    lastContact: "",
    documents: null,
  };

  return (
    <Card
      ref={cardRef}
      className={`bg-white/95 backdrop-blur-sm border-0 shadow-2xl transition-all duration-300 ${
        success ? "ring-2 ring-green-500 ring-opacity-50" : ""
      }`}
    >
      <CardHeader className="border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-6 h-6 text-blue-600" />
              Update Lead
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Edit the details below and save changes.
            </CardDescription>
          </div>
          <PriorityBadge priority={formData.priority} />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Lead updated successfully!
                </p>
                <p className="text-sm text-green-600">
                  The form will reset automatically in 3 seconds.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <X className="w-5 h-5 text-red-600" />
              <p className="font-medium text-red-800">
                {errors.submit}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Full name"
                    value={safeFormData.name || ""}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email (disabled) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={safeFormData.email || ""}
                    disabled
                    className="pl-10 bg-gray-100"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Phone number"
                    value={safeFormData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.phoneNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={safeFormData.category || ""}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  disabled={loadingCategories || isLoading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={loadingCategories ? "Loading..." : "Select Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                  Position
                </Label>
                <Input
                  id="position"
                  name="position"
                  type="text"
                  placeholder="Position"
                  value={safeFormData.position || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              {/* Lead Source */}
              <div className="space-y-2">
                <Label htmlFor="leadSource" className="text-sm font-medium text-gray-700">
                  Lead Source
                </Label>
                <Input
                  id="leadSource"
                  name="leadSource"
                  type="text"
                  placeholder="Lead Source"
                  value={safeFormData.leadSource || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                  Priority
                </Label>
                <Select
                  value={safeFormData.priority || ""}
                  onValueChange={(value) => handleSelectChange("priority", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select
                  value={safeFormData.status || ""}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="follow-up">Follow Up</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Last Contact */}
              <div className="space-y-2">
                <Label htmlFor="lastContact" className="text-sm font-medium text-gray-700">
                  Last Contact
                </Label>
                <Input
                  id="lastContact"
                  name="lastContact"
                  type="datetime-local"
                  value={safeFormData.lastContact || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              {/* Follow Up Dates */}
              <div className="space-y-2">
                <Label htmlFor="followUpDates" className="text-sm font-medium text-gray-700">
                  Follow Up Dates (comma separated)
                </Label>
                <Input
                  id="followUpDates"
                  name="followUpDates"
                  type="text"
                  placeholder="YYYY-MM-DD, YYYY-MM-DD"
                  value={formatFollowUpDatesForDisplay()}
                  onChange={handleFollowUpDatesChange}
                  disabled={isLoading}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={safeFormData.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Add any relevant notes here..."
                  disabled={isLoading}
                  className="min-h-[80px]"
                />
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <Label htmlFor="documents" className="text-sm font-medium text-gray-700">
                  Upload Document
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="documents"
                    name="documents"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  {formData.documents && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                      className="ml-2"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  )}
                </div>
                {errors.documents && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.documents}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-md shadow-lg transition-all duration-200 ease-in-out cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddLeadFormSection;