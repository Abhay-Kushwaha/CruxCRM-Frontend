import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";

interface Category {
    _id: string;
    title: string;
    color: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    categories: Category[];
    loading: boolean;
    error?: string;
    fetchCategories: () => void;
}

export default function CategorySelect({
    value,
    onChange,
    categories,
    loading,
    error,
    fetchCategories,
}: Props) {
    return (
        <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
            </Label>
            <Select
                value={value}
                onValueChange={onChange}
                disabled={loading}
            >
                <SelectTrigger className={error ? "border-red-500 focus:ring-red-500" : ""}>
                    {value ? (
                        <SelectValue>
                            {categories.find(cat => cat._id === value)?.title || "Select category"}
                        </SelectValue>
                    ) : (
                        <span className="text-gray-500">Select category</span>
                    )}
                </SelectTrigger>
                <SelectContent>
                    {loading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Loading categories...</span>
                        </div>
                    ) : categories.length > 0 ? (
                        categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                                    <span>{category.title}</span>
                                </div>
                            </SelectItem>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No categories available
                            <br />
                            <button
                                onClick={fetchCategories}
                                className="text-blue-500 hover:text-blue-700 text-xs mt-1"
                            >
                                Retry loading
                            </button>
                        </div>
                    )}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-sm text-red-600 dark:text-red-300 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
}