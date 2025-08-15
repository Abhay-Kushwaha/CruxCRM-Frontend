"use client";

// React and Next.js imports
import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import axios from "@/lib/Axios";
import {
  Tooltip,
  TooltipContent,
} from "@/components/ui/tooltip"
// Icon imports
import {
  LogOut, Plus, LayoutDashboard, Users, Copy, Layers, Briefcase, Mail, MessageSquare,
} from "lucide-react";

// UI Components
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarSeparator,
} from "@/components/ui/sidebar";
import { TooltipTrigger } from '@radix-ui/react-tooltip';

// Define the type for the user data
interface User {
  name: string;
  role:string;
}

// Menu items.
const items = [
  { title: "Dashboard", url: "/manager/dashboard", icon: LayoutDashboard },
  { title: "All Leads", url: "/leads/all-leads", icon: Users },
  { title: "Add Lead", url: "/leads/upload-leads", icon: Plus },
  { title: "Bulk Lead", url: "/leads/upload-leads-bulk", icon: Copy },
  { title: "Categories", url: "/manager/category", icon: Layers },
  { title: "Assignments", url: "/manager/assignment", icon: Briefcase },
  { title: "Conversation", url: "/leads/conversation", icon: MessageSquare },
  { title: "Campaigns", url: "/manager/campaign", icon: Mail },
];

const Appsidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  // State to store the user data
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect to fetch user data when the component mounts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/user/current');
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        // Optional: Redirect to login if auth fails
        // router.push("/manager/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]); // Added router to dependency array as it's used inside the effect

  // --- MODIFIED FUNCTION ---
  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axios.post('/user/logout');
    } catch (error) {
      console.error("Server-side logout failed, proceeding with client-side cleanup:", error);
    } finally {
      // Clear token cookies from the client
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "002=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Redirect to the login page
      router.push("/manager/auth/login");
    }
  };
  
  return (
    <Sidebar collapsible="icon" side="left" className="backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/90">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image src="/Indibus.jpg" alt="logo" width={30} height={30} className="rounded-2xl" />
                <span>Lead Management</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="-mx-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem
                  className={`rounded-xl transition-colors ${
                    pathname.startsWith(item.url)
                      ? "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  }`}
                  key={item.title}
                >
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className="-mx-0" />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
              <Tooltip>
            <SidebarMenuButton onClick={handleLogout} className="w-full justify-start">
            <TooltipTrigger asChild>
              <LogOut size={16} className="flex-shrink-0 text-red-400" />
               </ TooltipTrigger> 
              <div className="flex flex-col items-start ml-2 overflow-hidden">
                {isLoading ? (
                  <span className="text-sm text-gray-500">Loading...</span>
                ) : user ? (
                  <>
                    <span className="font-semibold text-sm truncate">{user.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">{user.role}</span>
                  </>
                ) : (
                  <span className="text-sm">Not Logged In</span>
                )}
              </div>
            </SidebarMenuButton>
                 
              <TooltipContent>
               <p>Logout</p>
               </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default Appsidebar;