"use client";

import {
  Users,
  TrendingUp,
  Activity,
  AlertTriangle,
  Plus,
  CheckCircle,
  UserPlus,
  Send,
  CalendarClock,
  Zap,
  Award,
  Clock,
  Rocket,
  Target,
  Timer,
  Star,
  Calendar as CalendarIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { format, formatDistanceToNow, addDays, differenceInDays, isAfter } from "date-fns";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
  BarChart,
  Bar,
  XAxis,
} from "recharts";
import axios from "@/lib/Axios"; 
import { Button } from "@/components/ui/button"; 
import { Calendar } from "@/components/ui/calendar"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; 
import { cn } from "@/lib/utils"; 
import { Skeleton } from "@/components/ui/skeleton"; 

// --- TYPE DEFINITIONS for API response ---
interface DashboardData {
  totalLeads: number;
  engagedLeads: number;
  conversationRate: string;
  overdueTasks: number;
  recentLeads: any[];
  recentNotifications: any[];
  leadsByCategory: { count: number; category: string }[];
  campaignPerformance: any[];
  upcomingDeadlines: any[];
  teamLeaderboard: any[];
  businessInsights: any;
  leadPipeline: { status: string; count: number }[];
  dailyLeadsLast7Days: { date: string; count: number }[];
  leadsBySource: { count: number; source: string }[];
}

// --- SKELETON COMPONENT ---
const DashboardSkeleton = () => {
    const CardSkeleton = () => (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="flex justify-center space-x-4 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    );
    
    const ListItemSkeleton = () => (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-12" />
        </div>
    );

    const ListCardSkeleton = ({ itemCount = 3 }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-6">
                {[...Array(itemCount)].map((_, i) => <ListItemSkeleton key={i} />)}
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-0">
                    <Skeleton className="h-10 w-[240px] sm:w-[300px]" />
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Skeleton className="h-6 w-6 rounded-md mb-4" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-32 mt-2" />
                    </div>
                ))}
            </div>

            {/* Main Dashboard Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column Skeleton */}
                <div className="lg:col-span-2 space-y-8">
                    <CardSkeleton />
                    <CardSkeleton />
                    <ListCardSkeleton itemCount={5}/>
                </div>

                {/* Right Column Skeleton */}
                <div className="space-y-8">
                    <ListCardSkeleton itemCount={4} />
                    <CardSkeleton />
                    <ListCardSkeleton itemCount={3} />
                </div>
            </div>
        </div>
    );
};

// --- CONSTANTS ---
const PIE_COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed"];
const FUNNEL_COLORS: { [key: string]: string } = {
  new: "#6366f1",
  "follow-up": "#818cf8",
  "in-progress": "#a5b4fc",
  closed: "#c7d2fe",
};
const MAX_RANGE_DAYS = 60;

// --- HELPER COMPONENTS ---
const KpiCard = ({ title, value, change, icon, unit = "" }: { title: string, value: number, change: number, icon: React.ReactNode, unit?: string }) => {
    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-center">
                <div className="text-gray-400">{icon}</div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{value}{unit}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    );
};

const InsightCard = ({ value, description, icon, unit = "" } : { value: string | number, description: string, icon: React.ReactNode, unit?: string }) => {
    return (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg flex items-center space-x-4 border border-indigo-200 dark:border-indigo-800">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                {icon}
            </div>
            <div>
                <p className="text-xl font-bold text-indigo-800 dark:text-white">{value}{unit}</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-300">{description}</p>
            </div>
        </div>
    );
};

// --- HELPER FUNCTIONS ---
const getStatusColor = (status: string) => {
    const lowerCaseStatus = status.toLowerCase();
    switch (lowerCaseStatus) {
        case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case "in-progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "qualified": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "closed": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        case "follow-up": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
};

const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'lead':
        case 'create':
            return <UserPlus className="w-5 h-5 text-blue-500" />;
        case 'conversion':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'campaign':
            return <Send className="w-5 h-5 text-purple-500" />;
        case 'delete':
            return <AlertTriangle className="w-5 h-5 text-red-500" />;
        default:
            return <Activity className="w-5 h-5 text-gray-500" />;
    }
};

const formatDateRelative = (dateString: string) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

// --- MAIN COMPONENT ---
const ManagerDashboardPage = () => {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -60),
        to: new Date(),
    });

    const handleDateSelect = (range: DateRange | undefined) => {
        if (!range) {
            setDate(range);
            return;
        }
        let { from, to } = range;
        if (from && to) {
            if (isAfter(from, to)) {
                [from, to] = [to, from];
            }
            if (differenceInDays(to, from) >= MAX_RANGE_DAYS) {
                to = addDays(from, MAX_RANGE_DAYS - 1);
            }
        }
        setDate({ from, to });
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!date || !date.from || !date.to) {
                setLoading(false);
                return;
            };

            setLoading(true);
            try {
                const params = {
                    startDate: format(date.from, "yyyy/MM/dd"),
                    endDate: format(date.to, "yyyy/MM/dd"),
                };
                const response = await axios.post('/manager/dashboard', params);
                if (response.data.success) {
                    setDashboardData(response.data);
                    console.log("Dashboard data fetched successfully:", response.data);
                    
                } else {
                    console.error("Failed to fetch dashboard data:", response.data.message);
                    setDashboardData(null);
                }
            } catch (error) {
                console.error("An error occurred while fetching dashboard data:", error);
                setDashboardData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [date]);

    // Data Transformation is memoized with useMemo to avoid re-calculation on every render
    const transformedData = React.useMemo(() => {
        if (!dashboardData) return null;
        console.log("Transforming dashboard data:", dashboardData.teamLeaderboard);
        
        const workerLeaderboard = dashboardData.teamLeaderboard.map(w => ({
            id: w.workerId,
            name: w.name,
            assigned: w.totalAssignedLeads,
            conversionPercentage: w.convertedPercentage ,
            avatar: w.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        })) ?? [];

        return {
            kpiData: {
                totalLeads: { value: dashboardData.totalLeads ?? 0, change: 0 },
                conversionRate: { value: parseFloat(dashboardData.conversationRate ?? "0"), change: 0 },
                engagedLeads: { value: dashboardData.engagedLeads ?? 0, change: 0 },
                overdueTasks: { value: dashboardData.overdueTasks ?? 0, change: 0 },
            },
            leadFunnelData: dashboardData.leadPipeline.map(p => ({
                status: p.status.charAt(0).toUpperCase() + p.status.slice(1).replace('-', ' '),
                value: p.count,
                fill: FUNNEL_COLORS[p.status] || "#d1d5db",
            })) ?? [],
            leadsByCategoryData: dashboardData.leadsByCategory.map(c => ({
                name: c.category,
                value: c.count,
            })) ?? [],
            leadSourceData: dashboardData.leadsBySource
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map(s => ({
                    name: s.source,
                    value: s.count,
                })) ?? [],
            campaignPerformanceData: dashboardData.campaignPerformance.slice(0, 5).map((c, i) => ({
                id: c._id || `c-${i}`,
                title: c.title,
                leadsTargeted: c.targetLeads,
                leadsConverted: c.convertedLeads,
                conversionRate: c.conversionRate,
            })) ?? [],
            workerLeaderboardData: workerLeaderboard,
            recentActivityData: dashboardData.recentNotifications.slice(0, 5).map(item => ({
                id: item._id,
                type: item.type.toUpperCase(),
                text: item.message,
                user: item.recipientType || "System",
                timestamp: formatDateRelative(item.createdAt),
                icon: getActivityIcon(item.type),
            })) ?? [],
            recentLeadsData: dashboardData.recentLeads.slice(0, 5).map(lead => ({
                id: lead._id,
                name: lead.name,
                company: lead.position || 'N/A',
                status: lead.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                assignedTo: lead.assignedTo ? (workerLeaderboard.find(w => w.id === lead.assignedTo)?.name || "Assigned") : "Unassigned",
            })) ?? [],
            upcomingDeadlinesData: dashboardData.upcomingDeadlines.map(item => ({
                id: item._id,
                leadName: item.name,
                assignedTo: workerLeaderboard.find(w => w.id === item.assignedTo)?.name || 'N/A',
                dueDate: item.followUpDates?.[0],
            })) ?? [],
            businessInsightsData: {
                leadVelocity: { value: parseFloat(dashboardData.businessInsights?.leadVelocityRate ?? "0").toFixed(1), unit: "% MoM", description: "Lead Velocity Rate" },
                avgResponseTime: { value: parseFloat(dashboardData.businessInsights?.averageLeadResponseTime ?? "0").toFixed(1), unit: " hours", description: "Avg. Lead Response Time" },
                topCampaign: { value: dashboardData.businessInsights?.topConvertingCampaign?.title ?? "N/A", description: "Top Converting Campaign" },
                mostEngagedWorker: { value: dashboardData.businessInsights?.mostEngagedWorker?.name ?? "N/A", description: "Most Engaged Worker" },
                topLeadSource: { value: dashboardData.businessInsights?.topLeadSource ?? "N/A", description: "Top Lead Source" },
                salesCycleDuration: { value: parseFloat(dashboardData.businessInsights?.averageSalesCycleDuration ?? "0").toFixed(1), unit: " days", description: "Avg. Sales Cycle Duration" },
                topCategory: { value: dashboardData.businessInsights?.highestPerformingCategory?.category ?? "N/A", description: "Highest Performing Category" },
            },
            leadsGeneratedData: dashboardData.dailyLeadsLast7Days.map(d => ({
                date: format(new Date(d.date), 'dd MMM'),
                leads: d.count,
            })) ?? [],
            totalLeadsGenerated: dashboardData.dailyLeadsLast7Days.reduce((acc, curr) => acc + curr.count, 0),
        };
    }, [dashboardData]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!transformedData) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Could not load dashboard data.</h2>
                        <p className="text-gray-500 mt-2">Please try selecting a different date range or refreshing the page.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Business Dashboard
                    </h1>
                    <p className="text-md text-gray-500 mt-1 dark:text-gray-400">
                        Welcome back, here's your performance overview.
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-0">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-[240px] sm:w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={handleDateSelect}
                                numberOfMonths={2}
                                disabled={{ after: new Date() }}
                            />
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" onClick={() => router.push("/manager/campaign")}>
                        <Plus className="w-4 h-4 mr-2" /> New Campaign
                    </Button>
                    <Button onClick={() => router.push("/leads/upload-leads")}>
                        <Plus className="w-4 h-4 mr-2" /> Add Lead
                    </Button>
                </div>
            </div>
            
            <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KpiCard title="Total Leads" value={transformedData.kpiData.totalLeads.value} change={0} icon={<Users className="w-6 h-6" />} />
                    <KpiCard title="Conversion Rate" value={transformedData.kpiData.conversionRate.value} change={0} icon={<TrendingUp className="w-6 h-6" />} unit="%" />
                    <KpiCard title="Engaged Leads" value={transformedData.kpiData.engagedLeads.value} change={0} icon={<Activity className="w-6 h-6" />} />
                    <KpiCard title="Overdue Tasks" value={transformedData.kpiData.overdueTasks.value} change={0} icon={<AlertTriangle className="w-6 h-6" />} />
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Leads Generated Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Leads Generated</h3>
                            <div className="flex items-start gap-4">
                                <p className="text-4xl font-bold text-gray-900 dark:text-white">{transformedData.totalLeadsGenerated.toLocaleString()}</p>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={transformedData.leadsGeneratedData}>
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                                            <Tooltip
                                                cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}
                                                contentStyle={{
                                                    background: 'rgba(255, 255, 255, 0.8)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '0.5rem',
                                                    backdropFilter: 'blur(4px)',
                                                }}
                                            />
                                            <Bar dataKey="leads" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Business Insights */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Business Insights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InsightCard value={transformedData.businessInsightsData.leadVelocity.value} unit={transformedData.businessInsightsData.leadVelocity.unit} description={transformedData.businessInsightsData.leadVelocity.description} icon={<Rocket className="w-6 h-6"/>} />
                                <InsightCard value={transformedData.businessInsightsData.avgResponseTime.value} unit={transformedData.businessInsightsData.avgResponseTime.unit} description={transformedData.businessInsightsData.avgResponseTime.description} icon={<Clock className="w-6 h-6"/>} />
                                <InsightCard value={transformedData.businessInsightsData.topCampaign.value} description={transformedData.businessInsightsData.topCampaign.description} icon={<Award className="w-6 h-6"/>} />
                                <InsightCard value={transformedData.businessInsightsData.mostEngagedWorker.value} description={transformedData.businessInsightsData.mostEngagedWorker.description} icon={<Zap className="w-6 h-6"/>} />
                                <InsightCard value={transformedData.businessInsightsData.topLeadSource.value} description={transformedData.businessInsightsData.topLeadSource.description} icon={<Target className="w-6 h-6"/>} />
                                <InsightCard value={transformedData.businessInsightsData.salesCycleDuration.value} unit={transformedData.businessInsightsData.salesCycleDuration.unit} description={transformedData.businessInsightsData.salesCycleDuration.description} icon={<Timer className="w-6 h-6"/>} />
                                <InsightCard value={transformedData.businessInsightsData.topCategory.value} description={transformedData.businessInsightsData.topCategory.description} icon={<Star className="w-6 h-6"/>} />
                            </div>
                        </div>
                        
                        {/* Lead Funnel */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Lead Pipeline</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <FunnelChart>
                                        <Tooltip />
                                        <Funnel dataKey="value" data={transformedData.leadFunnelData} isAnimationActive>
                                            <LabelList position="right" fill="#000" stroke="none" dataKey="status" className="font-semibold text-gray-700 dark:text-gray-200" />
                                        </Funnel>
                                    </FunnelChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Campaign Performance */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Campaign Performance</h3>
                                <button onClick={() => router.push('/manager/campaigns')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="p-3">Campaign Title</th>
                                            <th className="p-3 text-center">Leads Targeted</th>
                                            <th className="p-3 text-center">Leads Converted</th>
                                            <th className="p-3 text-center">Conversion Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transformedData.campaignPerformanceData.map(c => (
                                            <tr key={c.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="p-3 font-medium text-gray-900 dark:text-white">{c.title}</td>
                                                <td className="p-3 text-center text-gray-600 dark:text-gray-300">{c.leadsTargeted}</td>
                                                <td className="p-3 text-center text-gray-600 dark:text-gray-300">{c.leadsConverted}</td>
                                                <td className="p-3 text-center font-semibold text-green-600 dark:text-green-400">{c.conversionRate.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Leads */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Leads</h3>
                                <button onClick={() => router.push('/manager/leads')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View All</button>
                            </div>
                            <ul className="space-y-4">
                                {transformedData.recentLeadsData.map(lead => (
                                    <li key={lead.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white">{lead.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{lead.company}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(lead.status)}`}>
                                            {lead.status}
                                            </span>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                <p className="font-medium text-gray-800 dark:text-white">{lead.assignedTo}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
                            </div>
                            <ul className="space-y-4">
                                {transformedData.recentActivityData.map(item => (
                                    <li key={item.id} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">{item.icon}</div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-800 dark:text-white" dangerouslySetInnerHTML={{ __html: item.text.replace(/"([^"]*)"/g, "'<span class=\"font-semibold text-indigo-500\">$1</span>'") }}></p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.user} • {item.timestamp}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Leads by Category */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Leads by Category</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={transformedData.leadsByCategoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                                            {transformedData.leadsByCategoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconSize={10} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {/* Lead Source */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top 10 Lead Sources</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={transformedData.leadSourceData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                                            {transformedData.leadSourceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconSize={10} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {/* Team Leaderboard */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Team Leaderboard</h3>
                                <button onClick={() => router.push('/manager/team')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Manage Team</button>
                            </div>
                            <ul className="space-y-4">
                                {transformedData.workerLeaderboardData.map(w => (
                                    <li key={w.id} className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">{w.avatar}</div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 dark:text-white">{w.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{w.assigned} leads assigned</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-green-500">{w.conversionPercentage}%</p>
                                            <p className="text-xs text-gray-500">Converted</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Upcoming Deadlines */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Upcoming Deadlines</h3>
                                <button onClick={() => router.push('/manager/assignments')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">All Tasks</button>
                            </div>
                            <ul className="space-y-4">
                                {transformedData.upcomingDeadlinesData.map(item => (
                                    <li key={item.id} className="flex items-center space-x-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                                            <CalendarClock className="w-5 h-5 text-amber-600 dark:text-amber-400"/>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 dark:text-white">{item.leadName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Assigned to {item.assignedTo}</p>
                                        </div>
                                        <div className="text-sm font-semibold text-amber-700 dark:text-amber-500">{formatDateRelative(item.dueDate)}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
              </>
            
        </div>
    );
};

export default ManagerDashboardPage;