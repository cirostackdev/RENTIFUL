import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const listApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    let whereClause = {};
    if (userId && userType) {
      if (userType === "tenant") {
        whereClause = { tenantId: String(userId) };
      } else if (userType === "manager") {
        whereClause = { property: { managerId: String(userId) } };
      }
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            location: true,
            manager: { select: { id: true, name: true, email: true, phoneNumber: true } },
          },
        },
        tenant: { select: { id: true, name: true, email: true, phoneNumber: true } },
        lease: true,
      },
      orderBy: { applicationDate: "desc" },
    });

    function calculateNextPaymentDate(startDate: Date): Date {
      const today = new Date();
      const nextPaymentDate = new Date(startDate);
      while (nextPaymentDate <= today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      return nextPaymentDate;
    }

    const formattedApplications = applications.map((app) => ({
      ...app,
      property: { ...app.property, address: app.property.location.address },
      manager: app.property.manager,
      lease: app.lease
        ? { ...app.lease, nextPaymentDate: calculateNextPaymentDate(app.lease.startDate) }
        : null,
    }));

    res.json(formattedApplications);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving applications: ${error.message}` });
  }
};

export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationDate, propertyId, name, email, phoneNumber, message } = req.body;
    const tenantId = req.user!.userId;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const existingApplication = await prisma.application.findFirst({
      where: { propertyId, tenantId, status: { in: ["Pending", "Approved"] } },
    });

    if (existingApplication) {
      res.status(409).json({ message: "You already have an active application for this property" });
      return;
    }

    const newApplication = await prisma.application.create({
      data: {
        applicationDate: new Date(applicationDate),
        status: "Pending",
        name,
        email,
        phoneNumber,
        message,
        propertyId,
        tenantId,
      },
      include: {
        property: true,
        tenant: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(newApplication);
  } catch (error: any) {
    res.status(500).json({ message: `Error creating application: ${error.message}` });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: { property: true },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    if (application.status !== "Pending") {
      res.status(400).json({ message: "Only pending applications can be updated" });
      return;
    }

    if (status === "Approved") {
      const updatedApplication = await prisma.$transaction(async (tx) => {
        const lease = await tx.lease.create({
          data: {
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            rent: application.property.pricePerMonth,
            deposit: application.property.securityDeposit,
            propertyId: application.propertyId,
            tenantId: application.tenantId,
          },
        });

        await tx.property.update({
          where: { id: application.propertyId },
          data: { tenants: { connect: { id: application.tenantId } } },
        });

        return tx.application.update({
          where: { id: Number(id) },
          data: { status: "Approved", leaseId: lease.id },
          include: {
            property: true,
            tenant: { select: { id: true, name: true, email: true } },
            lease: true,
          },
        });
      });

      res.json(updatedApplication);
    } else {
      const updatedApplication = await prisma.application.update({
        where: { id: Number(id) },
        data: { status },
        include: {
          property: true,
          tenant: { select: { id: true, name: true, email: true } },
          lease: true,
        },
      });

      res.json(updatedApplication);
    }
  } catch (error: any) {
    res.status(500).json({ message: `Error updating application status: ${error.message}` });
  }
};
