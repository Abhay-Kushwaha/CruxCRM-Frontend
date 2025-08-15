"use client";

import {
  Users,
  Activity,
  AlertTriangle,
  Plus,
  CheckCircle,
  CalendarClock,
  Clock,
  Target,
  Timer,
  Star,
  AlertCircle,
  List,
  BarChart as BarChartIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { format, addDays, differenceInDays, isAfter } from "date-fns";
import axios from "@/lib/Axios";
import { Button } from "@/components/ui/button"; 
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// --- TYPE DEFINITION for API response ---
interface WorkerDashboardData {
  totalAssignedLeads: number;
  pendingFollowUps: number;
  followUpsToday: {
    count: number;
    data: { _id: string; name: string; company?: string }[];
  };
  missingFollowUps: number;
  performanceByCategory: {
    categoryId: string;
    totalLeads: number;
    profitable: number;
    nonprofitable: number;
    categoryName: string;
  }[];
  upcomingSchedule: {
    today: string[];
    tomorrow: string[];
  };
  overdueFollowUps: {
    _id: string;
    name: string;
    position?: string;
    followUpDates: string[];
  }[];
  recentAssignments: {
    _id: string;
    name: string;
    position?: string;
    createdAt: string;
    status: string;
  }[];
}

// --- SKELETON COMPONENT ---
const WorkerDashboardSkeleton = () => {
    const ListCardSkeleton = ({ itemCount = 3 }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-6">
                {[...Array(itemCount)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-12" />
                    </div>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <Skeleton className="h-10 w-[240px] sm:w-[300px]" />
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Skeleton className="h-6 w-6 rounded-md mb-4" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-4 w-32 mt-2" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border"><Skeleton className="h-64 w-full" /></div>
                    <ListCardSkeleton itemCount={3} />
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border"><Skeleton className="h-48 w-full" /></div>
                </div>
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border"><Skeleton className="h-72 w-full" /></div>
                    <ListCardSkeleton itemCount={2} />
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---
const KpiCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => {
    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-center">
                <div className="text-gray-400">{icon}</div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{value}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    );
};

const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const lowerCaseStatus = status.toLowerCase();
    switch (lowerCaseStatus) {
        case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case "in progress": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
        case "follow up": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "closed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
};

const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
};

// --- MAIN COMPONENT ---
const WorkerDashboardPage = () => {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<WorkerDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<DateRange | undefined>({ from: undefined, to: new Date() });

    const handleDateSelect = (range: DateRange | undefined) => {
        const MAX_RANGE_DAYS = 60;
        if (!range) {
            setDate(range);
            return;
        }
        let { from, to } = range;
        if (from && to) {
            if (isAfter(from, to)) [from, to] = [to, from];
            if (differenceInDays(to, from) >= MAX_RANGE_DAYS) {
                to = addDays(from, MAX_RANGE_DAYS - 1);
            }
        }
        setDate({ from, to });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
                    startDate: date?.from ? format(date.from, "yyyy/MM/dd") : null,
                    endDate: date?.to ? format(date.to, "yyyy/MM/dd") : format(new Date(), "yyyy/MM/dd"),
                };
                const response = await axios.post('/worker/dashboard', params);
                if (response.data.success) {
                    setDashboardData(response.data);
                } else {
                    setDashboardData(null);
                }
            } catch (error) {
                setDashboardData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [date]);

    const transformedData = React.useMemo(() => {
        if (!dashboardData) return null;
        return {
            kpiData: {
                totalAssignedLeads: dashboardData.totalAssignedLeads ?? 0,
                pendingFollowUp: dashboardData.pendingFollowUps ?? 0,
                leadsFollowUpToday: dashboardData.followUpsToday?.count ?? 0,
                leadsMissingFollowUp: dashboardData.missingFollowUps ?? 0,
            },
            categoryProfitableData: dashboardData.performanceByCategory.map(item => ({
                name: item.categoryName, // Corrected from CategoryName
                profitable: item.profitable,
                nonProfitable: item.nonprofitable,
            })),
            todayFollowUpList: dashboardData.followUpsToday.data.map(item => ({
                id: item._id,
                name: item.name,
                company: item.company || "N/A",
                time: "Today",
                status: "Pending",
            })),
            recentAssignments: dashboardData.recentAssignments.map(item => ({
                id: item._id,
                name: item.name,
                company: item.position || "N/A",
                assignedDate: item.createdAt,
                status: item.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            })),
            upcomingFollowUps: [
                ...(dashboardData.upcomingSchedule.today.length > 0 ? [{
                    date: new Date(),
                    events: dashboardData.upcomingSchedule.today.map(name => ({ name: `${name} Follow-up` }))
                }] : []),
                ...(dashboardData.upcomingSchedule.tomorrow.length > 0 ? [{
                    date: addDays(new Date(), 1),
                    events: dashboardData.upcomingSchedule.tomorrow.map(name => ({ name: `${name} Follow-up` }))
                }] : [])
            ],
            overdueFollowUps: dashboardData.overdueFollowUps.map(item => ({
                id: item._id,
                name: item.name,
                company: item.position || "N/A",
                dueDate: item.followUpDates?.[0] || "",
            })),
        };
    }, [dashboardData]);

    if (loading) {
        return <WorkerDashboardSkeleton />;
    }

    if (!transformedData) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Could not load dashboard data.</h2>
                    <p className="text-gray-500 mt-2">Please try selecting a different date range or refreshing the page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Worker Dashboard</h1>
                    <p className="text-md text-gray-500 mt-1 dark:text-gray-400">
                        Welcome back, manage your assigned leads and follow-ups.
                    </p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button id="date" variant={"outline"} className={cn("w-[240px] sm:w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : format(date.from, "LLL dd, y")) : <span>All Time</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={handleDateSelect} numberOfMonths={2} disabled={{ after: new Date() }} />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={() => router.push("/leads/upload-leads")}>
                        <Plus className="w-4 h-4 mr-2" /> Add Lead
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard title="Total Assigned Leads" value={transformedData.kpiData.totalAssignedLeads} icon={<Users className="w-6 h-6" />} />
                <KpiCard title="Pending Follow-Ups" value={transformedData.kpiData.pendingFollowUp} icon={<Activity className="w-6 h-6" />} />
                <KpiCard title="Follow-Ups Today" value={transformedData.kpiData.leadsFollowUpToday} icon={<CalendarClock className="w-6 h-6" />} />
                <KpiCard title="Leads with Missing Follow-Up" value={transformedData.kpiData.leadsMissingFollowUp} icon={<AlertCircle className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    {/* --- MODIFIED LEADS BY CATEGORY CARD --- */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Leads by Category</h3>
                        <div className="space-y-5">
                            {transformedData.categoryProfitableData.length > 0 ? (
                                transformedData.categoryProfitableData.map((item, index) => {
                                    const total = item.profitable + item.nonProfitable;
                                    const profitablePercentage = total > 0 ? (item.profitable / total) * 100 : 0;
                                    
                                    return (
                                        <div key={index}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold text-green-600">{item.profitable}</span> Profitable / <span className="font-semibold text-orange-600">{item.nonProfitable}</span> Non-Profitable
                                                </span>
                                            </div>
                                            <div className="w-full bg-red-400 dark:bg-red-400 rounded-full h-2.5" title={`Total: ${total}`}>
                                                <div
                                                    className="bg-green-500 h-2.5 rounded-full"
                                                    style={{ width: `${profitablePercentage}%` }}
                                                    title={`Profitable: ${profitablePercentage.toFixed(0)}%`}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-gray-500 py-4">No performance data available for the selected range.</p>
                            )}
                        </div>
                    </div>
                    {/* --- END OF MODIFIED CARD --- */}

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Today's Follow-Up List</h3>
                            <button onClick={() => router.push('/worker/follow-ups')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View All</button>
                        </div>
                        <div className="overflow-y-auto max-h-90">
                        <ul className="space-y-4">
                            {transformedData.todayFollowUpList.length > 0 ? transformedData.todayFollowUpList.map(item => (
                                <li key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.company}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>{item.status}</span>
                                </li>
                            )) : <p className="text-center text-gray-500 py-4">No follow-ups scheduled for today.</p>}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Assignments</h3>
                            <button onClick={() => router.push('/leads/all-leads')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 cursor-pointer">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Position</th>
                                        <th className="p-3">Assigned Date</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transformedData.recentAssignments.length > 0 ? transformedData.recentAssignments.map(item => (
                                        <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="p-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                            <td className="p-3 text-gray-600 dark:text-gray-300">{item.company}</td>
                                            <td className="p-3 text-gray-600 dark:text-gray-300">{formatDate(item.assignedDate)}</td>
                                            <td className="p-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>{item.status}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center text-gray-500 py-4">No recent assignments.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Follow-Ups</h3>
                        <Calendar
                            mode="multiple"
                            selected={transformedData.upcomingFollowUps.map(up => up.date)}
                            className="rounded-md border"
                            classNames={{ day_selected: "bg-indigo-500 text-white hover:bg-indigo-600 focus:bg-indigo-600", day_today: "bg-indigo-100 text-indigo-800" }}
                        />
                        <ul className="mt-4 space-y-2">
                            {transformedData.upcomingFollowUps.length > 0 ? transformedData.upcomingFollowUps.map((up, index) => (
                                <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                                    <strong>{format(up.date, "MMMM dd")}:</strong> <br />
                                    {up.events.map((e, i) => (
                                        <span key={i}>
                                            - {e.name.trim().replace('Follow-up', '')}
                                            <br />
                                        </span>
                                    ))}

                                </li>
                            )) : <p className="text-center text-gray-500 pt-4">No upcoming follow-ups found.</p>}
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Overdue Follow-Ups</h3>
                            <button onClick={() => router.push('/leads/all-leads')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 cursor-pointer">View All</button>
                        </div>
                        <ul className="space-y-4">
                            {transformedData.overdueFollowUps.length > 0 ? transformedData.overdueFollowUps.map(item => (
                                <li key={item.id} className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.company} - Due: {formatDate(item.dueDate)}</p>
                                    </div>
                                </li>
                            )) : <p className="text-center text-gray-500 py-4">No overdue follow-ups. <span className="text-green-500">Great job!</span></p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboardPage;