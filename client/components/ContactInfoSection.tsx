import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, X } from "lucide-react";

interface Props {
    formData: {
        name: string;
        email: string;
        phoneNumber: string;
    };
    errors: { [key: string]: string };
    isLoading: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ContactInfoSection({ formData, errors, isLoading, handleInputChange }: Props) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg dark:text-white font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Contact Info
            </h3>
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`pl-10 dark:bg-[#232b3e] dark:text-white dark:border-gray-700 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        disabled={isLoading}
                    />
                </div>
                {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-300 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.name}
                    </p>
                )}
            </div>
            {/* Email - Read Only */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email (Read Only)
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        className="pl-10 bg-gray-50 cursor-not-allowed"
                        disabled={true}
                        readOnly
                    />
                </div>
            </div>
            {/* Phone */}
            <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                </Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="Phone number"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.phoneNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        disabled={isLoading}
                    />
                </div>
                {errors.phoneNumber && (
                    <p className="text-sm text-red-600 dark:text-red-300 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.phoneNumber}
                    </p>
                )}
            </div>
        </div>
    );
}