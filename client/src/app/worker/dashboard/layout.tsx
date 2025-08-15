'use client'
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import WorkerSidebar from "../../../../components/Workersidebar";
import Navbar from "../../../../components/Navbar";

export default function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  pathname.startsWith('/worker/auth')
  const hideNavBar = false;
  return (
    <div className='bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <SidebarProvider>
        <main className="w-full flex">
          <WorkerSidebar />
          <div className="w-full flex flex-col">
            {!hideNavBar && (<Navbar />)}
            <div>
              {children}
            </div>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
