"use client";

import StoreProvider from "@/shared/state/redux";
import Auth from "@/features/auth/components/AuthProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <Auth>{children}</Auth>
    </StoreProvider>
  );
};

export default Providers;
