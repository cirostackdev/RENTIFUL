import { Request, Response } from "express";
import { wktToGeoJSON } from "@terraformer/wkt";
import { prisma } from "../../lib/prisma";

export const getManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const manager = await prisma.user.findUnique({
      where: { id: userId, role: "manager" },
      select: { id: true, name: true, email: true, phoneNumber: true },
    });

    if (!manager) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    res.json(manager);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving manager: ${error.message}` });
  }
};

export const getManagerProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const properties = await prisma.property.findMany({
      where: { managerId: userId },
      include: { location: true },
    });

    const propertiesWithFormattedLocation = await Promise.all(
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

    res.json(propertiesWithFormattedLocation);
  } catch (err: any) {
    res.status(500).json({ message: `Error retrieving manager properties: ${err.message}` });
  }
};
