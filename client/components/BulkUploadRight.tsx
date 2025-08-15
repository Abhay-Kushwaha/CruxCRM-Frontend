import React from "react";
import { X, Upload } from "lucide-react";

interface Category {
    _id: string;
    title: string;
}
interface Worker {
    _id: string;
    name: string;
}

interface OptionsAndSubmitSectionProps {
    category: string;
    setCategory: (value: string) => void;
    assignee: string;
    setAssignee: (value: string) => void;
    loading: boolean;
    excelFile: File | null;
    handleUpload: () => void;
    categories: Category[];
    loadingCategories: boolean;
    categoryError: string | null;
    fetchCategories: () => Promise<void>;
    workers: Worker[];
    loadingWorkers: boolean;
    workerError: string | null;
    fetchWorkers: () => Promise<void>;
    showWorkerDropdown: boolean;
}

const OptionsAndSubmitSection: React.FC<OptionsAndSubmitSectionProps> = ({
    category,
    setCategory,
    assignee,
    setAssignee,
    loading,
    excelFile,
    handleUpload,
    categories,
    loadingCategories,
    categoryError,
    fetchCategories,
    workers,
    loadingWorkers,
    workerError,
    fetchWorkers,
    showWorkerDropdown,
}) => (
    <div className="flex flex-col gap-6 flex-1 w-full max-w-full">
        {/* Default Category Select */}
        <div className="flex flex-col gap-2">
            <label htmlFor="defaultCategory" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Default Category
            </label>
            <select
                id="defaultCategory"
                className="border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading || loadingCategories}
            >
                {loadingCategories ? (
                    <option value="">Loading categories...</option>
                ) : categories.length > 0 ? (
                    <>
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.title}
                            </option>
                        ))}
                    </>
                ) : (
                    <option value="">No categories available</option>
                )}
            </select>
            {categoryError && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="w-3 h-3" /> {categoryError}
                    <button
                        onClick={fetchCategories}
                        className="text-blue-500 hover:text-blue-700 text-xs ml-1"
                    >
                        Retry
                    </button>
                </p>
            )}
        </div>
        {/* Default Assignee Select */}
        {showWorkerDropdown && (
            <div className="flex flex-col gap-2">
                <label htmlFor="defaultAssignee" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Default Assignee
                </label>
                <select
                    id="defaultAssignee"
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    disabled={loading || loadingWorkers}
                >
                    {loadingWorkers ? (
                        <option value="">Loading workers...</option>
                    ) : workers.length > 0 ? (
                        <>
                            <option value="">Select Worker</option>
                            {workers.map((worker, index) => (
                                <option key={index} value={worker._id}>
                                    {worker.name}
                                </option>
                            ))}
                        </>
                    ) : (
                        <option value="">No workers available</option>
                    )}
                </select>
                {workerError && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3" /> {workerError}
                        <button
                            onClick={fetchWorkers}
                            className="text-blue-500 hover:text-blue-700 text-xs ml-1"
                        >
                            Retry
                        </button>
                    </p>
                )}
            </div>
        )}
        <div className="flex flex-col gap-4 pt-2">
            <button
                onClick={handleUpload}
                disabled={loading || !excelFile || !category}
                className="bg-blue-600 text-white flex items-center justify-center gap-2 px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-md shadow-md transition-all duration-200 ease-in-out cursor-pointer"
            >
                {loading ? (
                    <>
                        <Upload className="animate-spin w-5 h-5" /> Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5" /> Upload & Submit
                    </>
                )}
            </button>
            <p className="text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-1 font-medium">
                ⚠️ Make sure your Excel is formatted correctly.
            </p>
        </div>
    </div>
);

export default OptionsAndSubmitSection;
