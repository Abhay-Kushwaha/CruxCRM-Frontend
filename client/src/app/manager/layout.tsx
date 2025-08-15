"use client";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import Appsidebar from "../../../components/Appsidebar";
import Navbar from "../../../components/Navbar";

export default function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  //NOTE: Un-comment below logic to remove navbar from auth pages.
  const hideNavBar = pathname.startsWith('/manager/auth');
  // const hideNavBar = false;
  return (
    <div className="">
          <SidebarProvider>
        {!hideNavBar && (
            <Appsidebar />
            )}
            <main className="w-full">
             {!hideNavBar &&(<Navbar />)} 
                {children}
            </main>
          </SidebarProvider>
    </div>
  );
  //   return (
  //     <SidebarProvider>
  //       <Appsidebar />
  //       <main className="w-full">
  //         <Navbar />
  //         <div className="">{children}</div>
  //       </main>
  //     </SidebarProvider>
  //   );
}
