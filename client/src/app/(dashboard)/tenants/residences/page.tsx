"use client";

import Card from "@/features/properties/components/Card";
import Header from "@/shared/components/Header";
import Loading from "@/shared/components/Loading";
import {
  useGetAuthUserQuery,
  useGetCurrentResidencesQuery,
  useGetTenantQuery,
} from "@/shared/state/api";
import React from "react";

const Residences = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(authUser?.userId || "", {
    skip: !authUser?.userId,
  });

  const {
    data: currentResidences,
    isLoading,
    error,
  } = useGetCurrentResidencesQuery(authUser?.userId || "", {
    skip: !authUser?.userId,
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading current residences</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="Current Residences"
        subtitle="View and manage your current living spaces"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentResidences?.map((property) => (
          <Card
            key={property.id}
            property={property}
            isFavorite={
              tenant?.favorites?.some(
                (fav: { id: number }) => fav.id === property.id
              ) || false
            }
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/tenants/residences/${property.id}`}
          />
        ))}
      </div>
      {(!currentResidences || currentResidences.length === 0) && (
        <p>You don&lsquo;t have any current residences</p>
      )}
    </div>
  );
};

export default Residences;
