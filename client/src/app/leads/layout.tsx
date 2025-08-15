"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import Appsidebar from "../../../components/Appsidebar";
import Workersidebar from "../../../components/Workersidebar";
import Navbar from "../../../components/Navbar";
export default function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const allCookies = document.cookie.split(";").map((cookie) => cookie.trim());
  const found001 = allCookies.some((cookie) => cookie.startsWith("001"));
  console.log("Found 001 cookie:", found001);

  //NOTE: Un-comment below logic to remove navbar from auth pages.
  const hideNavBar = pathname.startsWith('/manager/auth');
  // const hideNavBar = false;
  return (
    <div className="">
      <SidebarProvider>
        {!hideNavBar && (
          found001 ? <Workersidebar /> : <Appsidebar />
        )}
        <main className="w-full">
          {!hideNavBar && <Navbar />}
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}