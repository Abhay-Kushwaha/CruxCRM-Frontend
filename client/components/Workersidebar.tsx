import { LogOut, Plus, LayoutDashboard, Users, Copy, FileText, MessageSquare } from "lucide-react"
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/Axios";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"

interface User {
  name: string;
  role: string;
}

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/worker/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "All Leads",
    url: "/leads/all-leads",
    icon: Users,
  },
  {
    title: "Add Lead",
    url: "/leads/upload-leads",
    icon: Plus,
  },
  {
    title: "Bulk Lead",
    url: "/leads/upload-leads-bulk",
    icon: Copy,
  },
  {
    title: "Conversation",
    url: "/leads/conversation",
    icon: MessageSquare,
  },
]

const WorkerSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/user/current');
        if (response.data.success) {
          setUser(response.data.data);
        }
      }
      catch (error) {
        console.error("Failed to fetch current user:", error);
      }
      finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  // --- MODIFIED FUNCTION ---
  const handleLogout = async () => {
    try {
      await axios.post('/user/logout');
    } catch (error) {
      console.error("Server-side logout failed, proceeding with client-side cleanup:", error);
    } finally {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "002=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/worker/auth/login");
    }
  }

  return (
    <Sidebar collapsible="icon" side="left" className="backdrop-blur-sm border-1 border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/90">
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
              {
                items.map(item => (
                  <SidebarMenuItem className={`rounded-xl ${item.url === pathname ? "bg-gray-200 text-black" : "rounded"}`} key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>
      <SidebarSeparator className="-mx-0" />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="cursor-pointer">
              <LogOut size={16} className="flex-shrink-0 text-red-400" />
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default WorkerSidebar;