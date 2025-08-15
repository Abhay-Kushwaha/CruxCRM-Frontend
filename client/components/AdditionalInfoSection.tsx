import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import DocumentUpload from "@/../components/DocumentUpload";
import { Textarea } from "@/components/ui/textarea";

interface Props {
    formData: {
        priority: "high" | "medium" | "low";
        lastContact: string;
        documents: File | null;
        notes: string;
    };
    errors: { [key: string]: string };
    isLoading: boolean;
    handleSelectChange: (field: string, value: string) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeFile: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function AdditionalInfoSection({
    formData,
    errors,
    isLoading,
    handleSelectChange,
    handleInputChange,
    handleFileChange,
    removeFile,
    fileInputRef,
}: Props) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg dark:text-white font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Additional Info
            </h3>
            {/* Priority */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                </Label>
                <Select
                    value={formData.priority}
                    onValueChange={(value: string) => handleSelectChange("priority", value)}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            {formData.priority === "high" && <ArrowUp className="w-4 h-4 text-red-500" />}
                            {formData.priority === "medium" && <ArrowRight className="w-4 h-4 text-yellow-500" />}
                            {formData.priority === "low" && <ArrowDown className="w-4 h-4 text-green-500" />}
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="high">
                            <div className="flex items-center gap-2">
                                <ArrowUp className="w-4 h-4 text-red-500" />
                                <span>High</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-yellow-500" />
                                <span>Medium</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="low">
                            <div className="flex items-center gap-2">
                                <ArrowDown className="w-4 h-4 text-green-500" />
                                <span>Low</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Last Contact */}
            <div className="space-y-2">
                <Label htmlFor="lastContact" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Contact Date
                </Label>
                <Input
                    id="lastContact"
                    name="lastContact"
                    type="datetime-local"
                    value={formData.lastContact}
                    onChange={handleInputChange}
                    disabled={isLoading}
                />
            </div>
            {/* Document Upload */}
            <div className="space-y-2">
                <DocumentUpload
                    file={formData.documents}
                    onFileChange={handleFileChange}
                    onRemove={removeFile}
                    error={errors.documents}
                    loading={isLoading}
                    fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                />
            </div>
            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                </Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="min-h-[80px] resize-none"
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}