import React from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExcelUploadSectionProps {
    excelFile: File | null;
    excelPreview: string[][];
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExcelUploadSection: React.FC<ExcelUploadSectionProps> = ({
    excelFile,
    excelPreview,
    handleFileChange,
}) => (
    <div className="flex flex-col text-left gap-2 flex-1 w-full max-w-full">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Choose Excel File
        </span>
        <Label
            htmlFor="document"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-400 dark:border-blue-600 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors duration-200 group relative shadow-md"
        >
            <div className="flex flex-col items-center justify-center py-10 px-2">
                <Upload className="w-12 h-12 text-blue-400 dark:text-blue-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                <p className="text-base text-gray-600 dark:text-gray-300 text-center">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        Click to upload
                    </span>{' '}
                    or drag and drop
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                    (Excel only, .xlsx, max 5MB)
                </p>
            </div>
            {excelFile && (
                <p className="absolute bottom-3 text-base text-green-600 dark:text-green-300 font-medium px-2 truncate w-full text-center">
                    File selected: <span className="font-bold">{excelFile.name}</span>
                </p>
            )}
            <Input
                id="document"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".xlsx"
            />
        </Label>
        {/* Excel Preview Table */}
        {excelFile && excelPreview.length > 0 && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900 rounded-lg p-4 shadow-inner w-full overflow-x-auto">
                <div className="text-xs font-semibold mb-2 text-blue-700 dark:text-blue-200">Excel Preview (first 5 rows):</div>
                <table className="min-w-full text-xs border border-blue-200 dark:border-blue-700 rounded-md bg-white dark:bg-gray-900">
                    <thead>
                        <tr>
                            {excelPreview[0].map((header, idx) => (
                                <th key={idx} className="p-2 border-b border-blue-200 dark:border-blue-700 text-left text-blue-900 dark:text-blue-100">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {excelPreview.slice(1, 6).map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td key={j} className="p-2 border-b border-blue-50 dark:border-blue-800 text-gray-700 dark:text-gray-200">{j === row.length - 1
                                        ? cell.length > 20
                                            ? `${cell.slice(0, 20)}...` : cell
                                    : cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

export default ExcelUploadSection;
