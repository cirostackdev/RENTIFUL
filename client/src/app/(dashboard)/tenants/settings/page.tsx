"use client";

import SettingsForm from "@/features/settings/components/SettingsForm";
import { useGetAuthUserQuery, useUpdateSettingsMutation } from "@/shared/state/api";
import React from "react";

const TenantSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const [updateSettings] = useUpdateSettingsMutation();

  if (isLoading) return <>Loading...</>;

  const initialData = {
    name: authUser?.name,
    email: authUser?.email,
    phoneNumber: authUser?.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    await updateSettings(data);
  };

  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType="tenant"
    />
  );
};

export default TenantSettings;
