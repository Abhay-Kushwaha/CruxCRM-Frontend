"use client";

import React, { useState, useEffect } from "react";
import { Download, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import BulkUploadLeft from "../../../../components/BulkUploadLeft";
import BulkUploadRight from "../../../../components/BulkUploadRight";
import axios from "@/lib/Axios";
import * as XLSX from "xlsx";

// Interfaces and component logic remain exactly the same...
interface Category {
  _id: string;
  title: string;
  description: string;
  color: string;
  createdAt: string;
  __v: number;
}
interface Worker {
  _id: string;
  name: string;
}

const BulkUploadPage = () => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [assignee, setAssignee] = useState(""); // stores worker ID
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState<boolean>(true);
  const [workerError, setWorkerError] = useState<string | null>(null);
  const [excelPreview, setExcelPreview] = useState<string[][]>([]);
  const [showWorkerDropdown, setShowWorkerDropdown] = useState(true);

  // All your existing functions (fetchCategories, fetchWorkers, handleFileChange, etc.) go here without any changes.
  // ... (omitting for brevity, no changes needed)
  const fetchCategories = async (): Promise<void> => {
    setLoadingCategories(true);
    setCategoryError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/category', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        setCategoryError("Failed to load categories. Please try again.");
      }
    } catch (error: any) {
      setCategoryError(error.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    setWorkerError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/worker/get-all-workers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data.data)) {
        setWorkers(response.data.data);
      } else {
        setWorkerError("Failed to load workers. Please try again.");
      }
    } catch (error: any) {
      setWorkerError(error.response?.data?.message || "Failed to load workers.");
    } finally {
      setLoadingWorkers(false);
    }
  };
  useEffect(() => { fetchWorkers(); }, []);

  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const has001 = cookies.some((c) => c.startsWith("001"));
    setShowWorkerDropdown(!has001);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith(".xlsx"))) {
      setExcelFile(file);
      previewExcel(file);
    } else {
      toast.error("Please upload a valid Excel (.xlsx) file.");
      setExcelFile(null);
      setExcelPreview([]);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ["name", "email", "phoneNumber", "position", "leadSource", "priority", "notes"];
    const example = [["Raman", "raman@example.com", "9876543210", "Developer", "Advertisement", "high", "Some notes about the lead."]];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeadsTemplate");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lead_template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setExcelPreview(rows);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!excelFile) {
      toast.error("Please select an Excel file.");
      return;
    }
    if (!category) {
      toast.error("Please select a default category.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("category", category);
    if (assignee) {
      formData.append("assignedTo", assignee); // Use worker ID
    }
    try {
      console.log("Uploading leads with formData:", formData);
      const res = await axios.post("/lead/bulk-upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        toast.success("Leads uploaded successfully!");
        setExcelFile(null);
        setCategory("");
        setAssignee("");
        setExcelPreview([]);
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Upload error:", error.response);
      toast.error(error?.response?.data?.message || "Upload error.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col">
      {/* === Container === */}
      <div className="flex flex-col flex-1 items-center px-4 py-4 max-w-7xl mx-auto w-full">

        {/* === HEADER === */}
        <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center px-5 gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Bulk Upload Leads
            </h1>
            <p className="mt-1 text-md text-gray-600 dark:text-gray-400">
              Easily upload, preview, and assign large sets of leads from an Excel file.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </header>

        {/* === MAIN UPLOAD CARD === */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-5xl">
          <div className="flex flex-col lg:flex-row">

            {/* === LEFT SIDE === */}
            <div className="w-full lg:w-3/5 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
              <BulkUploadLeft
                excelFile={excelFile}
                excelPreview={excelPreview}
                handleFileChange={handleFileChange}
              />
            </div>

            {/* === RIGHT SIDE === */}
            <div className="w-full lg:w-2/5 p-6 md:p-8">
              <BulkUploadRight
                category={category}
                setCategory={setCategory}
                assignee={assignee}
                setAssignee={setAssignee}
                loading={loading}
                excelFile={excelFile}
                handleUpload={handleUpload}
                categories={categories}
                loadingCategories={loadingCategories}
                categoryError={categoryError}
                fetchCategories={fetchCategories}
                workers={workers}
                loadingWorkers={loadingWorkers}
                workerError={workerError}
                fetchWorkers={fetchWorkers}
                showWorkerDropdown={showWorkerDropdown}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  //           </div >
  //         </div >
  //       </div >
  //     </div >
  //   </div >
  // );
};

export default BulkUploadPage;