"use client";

import AssignmentTable from "@/../components/AssignmentTable";
import NewAssignmentDialog from "@/../components/NewAssignmentDialog";
import {
    ListChecks,
    Clock3,
    CheckCircle2,
    AlarmClockOff,
} from "lucide-react";
import axios from "@/lib/Axios";
import React, { useEffect, useState } from "react";

// Define the Lead interface to match the backend response structure
interface Lead {
    id: string;
    name: string;
    email: string | null;
    phoneNumber: string | null;
    category: {
        id: string;
        title: string;
        color: string;
        description: string;
    } | null;
    position: string;
    leadSource: string;
    notes: string;
    createdBy: {
        id: string;
        name: string;
    };
    status: 'new' | 'in-progress' | 'follow-up' | 'closed';
    priority: 'high' | 'medium' | 'low';
    followUpDates: string[];
    isDeleted: boolean;
    createdAt: string;
    assignedTo: {
        id: string;
        name: string;
    } | null;
    documents: string[]; // Array of document URLs
    conversations: string[]; // Array of conversation IDs
    lastContact: string; // Last contact date
}

// Define the interface for data to be passed to AssignmentTable
export interface AssignmentTableData {
    id: string;
    name: string; 
    position: string;
    category: string; 
    status: 'Active' | 'Completed' | 'Overdue'; // Mapped status
    priority: 'High' | 'Medium' | 'Low'; 
    assignedTo: string; // Assigned worker name
    dueDate: string;
}

// API function to fetch leads
const fetchLeads = async (): Promise<Lead[]> => {
    try {
        const res = await axios.get("/lead/leads");
        console.log("Response from server:", res.data);
        const { data } = res.data;
        if (!data) {
            throw new Error("Invalid response structure from server.");
        }
        console.log("Assigned Leads fetched>>>", data);

        const validStatuses = ["new", "in-progress", "follow-up", "closed"];
        const validPriorities = ["high", "medium", "low"];

        // Filter and map the leads to the Lead interface
        const assignments: Lead[] = data
            .filter((lead: any) =>
                lead.assignedTo &&
                validStatuses.includes(lead.status) &&
                validPriorities.includes(lead.priority)
            )
            .map((lead: any) => ({
                id: lead._id, // Changed from id to _id
                name: lead.name || "N/A",
                email: lead.email || null,
                phoneNumber: lead.phoneNumber ? String(lead.phoneNumber) : null, // Convert to string
                category: lead.category ? {
                    id: lead.category._id || "",
                    title: lead.category.title || "Uncategorized",
                    color: lead.category.color || "#808080",
                    description: lead.category.description || ""
                } : null,
                position: lead.position || "N/A",
                leadSource: lead.leadSource || "N/A",
                notes: lead.notes || "N/A",
                createdBy: {
                    id: lead.createdBy || "",
                    name: "Unknown" // You might want to fetch user details separately
                },
                status: lead.status,
                priority: lead.priority,
                followUpDates: lead.followUpDates || [],
                isDeleted: lead.isDeleted || false,
                createdAt: lead.createdAt || "",
                assignedTo: lead.assignedTo ? {
                    id: lead.assignedTo,
                    name: lead.assignedTo.name
                } : null,
            }));

        console.log("Filtered assigned leads >>>", assignments);
        return assignments;
    }
    catch (error: any) {
        console.error("Axios error fetching leads:", error?.response || error.message);
        throw error;
    }
};

export default function ManagerAssignmentsPage() {
    const [assignments, setAssignments] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getLeads = async () => {
            setLoading(true);
            try {
                const leads = await fetchLeads();
                setAssignments(leads);
            } catch (err) {
                // Handle error state, e.g., show a message to the user
                console.error("Failed to fetch leads:", err);
                setAssignments([]);
            } finally {
                setLoading(false);
            }
        };
        getLeads();
    }, []);

    // Calculate summary statistics
    const summary = {
        total: assignments.length,
        active: assignments.filter((a) => a.status === "new" || a.status === "in-progress").length, // 'new' and 'in-progress' are active
        completed: assignments.filter((a) => a.status === "closed").length, // Only 'closed' is completed
        overdue: assignments.filter((a) => a.status === "follow-up").length, // 'follow-up' indicates overdue
    };

    // Map raw assignments to AssignmentTableData for rendering
    const assignmentsForTable: AssignmentTableData[] = assignments.map(a => ({
        id: a.id,
        name: a.name,
        position: a.position,
        category: a.category?.title || "Not Assigned", // Use category title, default if null
        status: (a.status === "new" || a.status === "in-progress"
            ? "Active"
            : a.status === "follow-up"
                ? "Overdue"
                : "Completed") as "Active" | "Completed" | "Overdue", // Corrected status mapping
        priority: (a.priority === "high"
            ? "High"
            : a.priority === "medium"
                ? "Medium"
                : "Low") as "High" | "Medium" | "Low",
        assignedTo: a.assignedTo?.name || "Unassigned", // Use assignedTo name, default if null
        dueDate: a.followUpDates && a.followUpDates.length > 0
            ? new Date(a.followUpDates[0]).toLocaleDateString()
            : new Date(a.createdAt).toLocaleDateString(), 
    }));

    return (
        <div className="p-8 relative min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Lead Assignments
                </h1>
                <NewAssignmentDialog />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {/* Total Assignments Card */}
                <div className="p-5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border-l-4 border-blue-500 dark:border-blue-700 flex items-center justify-between transition-all duration-200 hover:shadow-xl hover:scale-[1.01]">
                    <div>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-medium mb-1">Total Assignments</p>
                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{summary.total}</h3>
                    </div>
                    <ListChecks className="w-14 h-14 text-blue-500 dark:text-blue-400 opacity-80" />
                </div>

                {/* Active Assignments Card */}
                <div className="p-5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border-l-4 border-yellow-500 dark:border-yellow-700 flex items-center justify-between transition-all duration-200 hover:shadow-xl hover:scale-[1.01]">
                    <div>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-medium mb-1">Active</p>
                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{summary.active}</h3>
                    </div>
                    <Clock3 className="w-14 h-14 text-yellow-500 dark:text-yellow-400 opacity-80" />
                </div>

                {/* Completed Assignments Card */}
                <div className="p-5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border-l-4 border-green-500 dark:border-green-700 flex items-center justify-between transition-all duration-200 hover:shadow-xl hover:scale-[1.01]">
                    <div>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-medium mb-1">Completed</p>
                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{summary.completed}</h3>
                    </div>
                    <CheckCircle2 className="w-14 h-14 text-green-500 dark:text-green-400 opacity-80" />
                </div>

                {/* Overdue Assignments Card */}
                <div className="p-5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border-l-4 border-red-500 dark:border-red-700 flex items-center justify-between transition-all duration-200 hover:shadow-xl hover:scale-[1.01]">
                    <div>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-medium mb-1">Overdue</p>
                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{summary.overdue}</h3>
                    </div>
                    <AlarmClockOff className="w-14 h-14 text-red-500 dark:text-red-400 opacity-80" />
                </div>
            </div>
            {loading ? (
                <div className="text-center py-10 text-lg text-gray-600 dark:text-gray-300">Loading assignments...</div>
            ) : (
                <AssignmentTable assignments={assignmentsForTable} />
            )}
        </div>
    );
}
