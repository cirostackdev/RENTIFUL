import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/shared/state/api";
import { useAppSelector } from "@/shared/state/redux";
import Card from "@/features/properties/components/Card";
import CardCompact from "@/features/properties/components/CardCompact";
import React from "react";

const Listings = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(authUser?.userId || "", {
    skip: !authUser?.userId || authUser?.userRole !== "tenant",
  });
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const filters = useAppSelector((state) => state.global.filters);

  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!authUser) return;

    const isFavorite = tenant?.favorites?.some(
      (fav: { id: number }) => fav.id === propertyId
    );

    if (isFavorite) {
      await removeFavorite({ userId: authUser.userId, propertyId });
    } else {
      await addFavorite({ userId: authUser.userId, propertyId });
    }
  };

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="w-full">
      <h3 className="text-sm px-4 font-bold">
        {properties.length}{" "}
        <span className="text-gray-700 font-normal">
          Places in {filters.location}
        </span>
      </h3>
      <div className="flex">
        <div className="p-4 w-full">
          {properties?.map((property) =>
            viewMode === "grid" ? (
              <Card
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: { id: number }) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
              />
            ) : (
              <CardCompact
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: { id: number }) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;
