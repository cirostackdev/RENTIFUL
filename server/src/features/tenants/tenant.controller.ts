import { Request, Response } from "express";
import { wktToGeoJSON } from "@terraformer/wkt";
import { prisma } from "../../lib/prisma";

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const tenant = await prisma.user.findUnique({
      where: { id: userId, role: "tenant" },
      select: { id: true, name: true, email: true, phoneNumber: true, favorites: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    res.json(tenant);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving tenant: ${error.message}` });
  }
};

export const getCurrentResidences = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const properties = await prisma.property.findMany({
      where: { tenants: { some: { id: userId } } },
      include: { location: true },
    });

    const residencesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] =
          await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];

        return {
          ...property,
          location: { ...property.location, coordinates: { longitude, latitude } },
        };
      })
    );

    res.json(residencesWithFormattedLocation);
  } catch (err: any) {
    res.status(500).json({ message: `Error retrieving residences: ${err.message}` });
  }
};

export const addFavoriteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, propertyId } = req.params;
    const tenant = await prisma.user.findUnique({
      where: { id: userId, role: "tenant" },
      include: { favorites: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    if (tenant.favorites.some((fav) => fav.id === propertyIdNumber)) {
      res.status(409).json({ message: "Property already in favorites" });
      return;
    }

    const updatedTenant = await prisma.user.update({
      where: { id: userId },
      data: { favorites: { connect: { id: propertyIdNumber } } },
      include: { favorites: true },
    });

    res.json(updatedTenant);
  } catch (error: any) {
    res.status(500).json({ message: `Error adding favorite: ${error.message}` });
  }
};

export const removeFavoriteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, propertyId } = req.params;
    const updatedTenant = await prisma.user.update({
      where: { id: userId },
      data: { favorites: { disconnect: { id: Number(propertyId) } } },
      include: { favorites: true },
    });

    res.json(updatedTenant);
  } catch (err: any) {
    res.status(500).json({ message: `Error removing favorite: ${err.message}` });
  }
};
