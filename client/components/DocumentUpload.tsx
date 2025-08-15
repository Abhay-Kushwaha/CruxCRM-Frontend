import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";

interface Props {
    file: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    error?: string;
    loading?: boolean;
    fileInputRef?: React.RefObject<HTMLInputElement>;
}

export default function DocumentUpload({
    file,
    onFileChange,
    onRemove,
    error,
    loading,
    fileInputRef,
}: Props) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Documents</Label>
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="document"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                        <Upload className="w-6 h-6 text-gray-400 mb-1 group-hover:text-gray-500 transition-colors" />
                        <p className="text-xs text-gray-500 text-center">
                            <span className="font-semibold">Click to upload</span>
                        </p>
                    </div>
                    <Input
                        ref={fileInputRef}
                        id="document"
                        type="file"
                        className="hidden"
                        onChange={onFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.jpeg,.txt"
                        disabled={loading}
                    />
                </Label>
                {file && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onRemove}
                            className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                            disabled={loading}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-600 dark:text-red-300 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
}