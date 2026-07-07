"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetAuthUserQuery } from "@/shared/state/api";

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = /^\/(signin|signup)$/.test(pathname);
  const isDashboardPage =
    pathname.startsWith("/managers") || pathname.startsWith("/tenants");

  useEffect(() => {
    if (!isLoading && authUser && isAuthPage) {
      router.push("/");
    }
  }, [authUser, isAuthPage, isLoading, router]);

  useEffect(() => {
    if (!isLoading && !authUser && isDashboardPage) {
      router.push("/signin");
    }
  }, [authUser, isDashboardPage, isLoading, router]);

  if (isLoading && isDashboardPage) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700" />
      </div>
    );
  }

  return <>{children}</>;
};

export default Auth;
