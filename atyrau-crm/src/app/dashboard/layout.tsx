"use client";

import { Navigation } from "@/components/organisms/Navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();

  // Check authentication and role
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }

    if (status === "authenticated" && session?.user?.role === "client") {
      redirect("/profile");
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Navigation component handles both desktop and mobile navigation */}
      <Navigation />

      {/* Main content */}
      <div className="md:pl-64">
        <main className="pt-16 md:pt-0 pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
