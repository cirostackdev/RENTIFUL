import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { Location } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import axios from "axios";
import path from "path";
import fs from "fs";

export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
      page,
      limit,
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (pageNum - 1) * pageSize;

    let whereConditions: Prisma.Sql[] = [];

    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
      );
    }

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`
      );
    }

    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    }

    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
    }

    if (squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`
      );
    }

    if (squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`
      );
    }

    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
      );
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",");
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
    }

    if (availableFrom && availableFrom !== "any") {
      const availableFromDate =
        typeof availableFrom === "string" ? availableFrom : null;
      if (availableFromDate) {
        const date = new Date(availableFromDate);
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l2
              WHERE l2."propertyId" = p.id
              AND l2."startDate" <= ${date.toISOString()}
            )`
          );
        }
      }
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusInKilometers = 1000;
      const degrees = radiusInKilometers / 111;

      whereConditions.push(
        Prisma.sql`ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`
      );
    }

    const whereClause =
      whereConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
        : Prisma.empty;

    const countQuery = Prisma.sql`
      SELECT COUNT(*)::int as total
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${whereClause}
    `;

    const dataQuery = Prisma.sql`
      SELECT
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${whereClause}
      ORDER BY p."postedDate" DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const [countResult, properties] = await Promise.all([
      prisma.$queryRaw<[{ total: number }]>(countQuery),
      prisma.$queryRaw(dataQuery),
    ]);

    const total = countResult[0].total;

    res.json({
      data: properties,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving properties: ${error.message}` });
  }
};

export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
        manager: {
          select: { id: true, name: true, email: true, phoneNumber: true },
        },
      },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const coordinates: { coordinates: string }[] =
      await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

    const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
    const longitude = geoJSON.coordinates[0];
    const latitude = geoJSON.coordinates[1];

    const propertyWithCoordinates = {
      ...property,
      location: {
        ...property.location,
        coordinates: { longitude, latitude },
      },
    };

    res.json(propertyWithCoordinates);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${err.message}` });
  }
};

export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { address, city, state, country, postalCode, ...propertyData } =
      req.body;

    const managerId = req.user!.userId;

    const uploadsDir = path.join(__dirname, "../../../uploads/properties");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const photoUrls = files.map((file) => {
      const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "")}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, file.buffer);
      return `/uploads/properties/${filename}`;
    });

    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      street: address,
      city,
      country,
      postalcode: postalCode,
      format: "json",
      limit: "1",
    }).toString()}`;

    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: { "User-Agent": "Rentiful/1.0 (contact@rentiful.com)" },
    });

    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
            parseFloat(geocodingResponse.data[0].lon),
            parseFloat(geocodingResponse.data[0].lat),
          ]
        : [0, 0];

    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;

    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerId,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
            : [],
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(newProperty);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error creating property: ${err.message}` });
  }
};
