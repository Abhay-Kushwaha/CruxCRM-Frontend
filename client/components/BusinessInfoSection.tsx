import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CategorySelect from "@/../components/CategorySelect";

interface Category {
    _id: string;
    title: string;
    color: string;
}

interface Props {
    formData: {
        position: string;
        category: string;
        leadSource: string;
    };
    categories: Category[];
    loadingCategories: boolean;
    errors: { [key: string]: string };
    isLoading: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (field: string, value: string) => void;
    fetchCategories: () => void;
}

export default function BusinessInfoSection({
    formData,
    categories,
    loadingCategories,
    errors,
    isLoading,
    handleInputChange,
    handleSelectChange,
    fetchCategories,
}: Props) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg dark:text-white font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Business Info
            </h3>
            {/* Position */}
            <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position
                </Label>
                <Input
                    id="position"
                    name="position"
                    type="text"
                    placeholder="Position/title"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled={isLoading}
                />
            </div>
            {/* Category */}
            <div className="space-y-2">
                <CategorySelect
                    value={formData.category}
                    onChange={(value) => handleSelectChange("category", value)}
                    categories={categories}
                    loading={loadingCategories}
                    error={errors.category || errors.categories}
                    fetchCategories={fetchCategories}
                />
            </div>
            {/* Lead Source */}
            <div className="space-y-2">
                <Label htmlFor="leadSource" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source
                </Label>
                <Input
                    id="leadSource"
                    name="leadSource"
                    type="text"
                    placeholder="Lead source"
                    value={formData.leadSource}
                    onChange={handleInputChange}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}