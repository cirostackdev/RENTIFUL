import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const whereClause =
      role === "manager"
        ? { property: { managerId: userId } }
        : { tenantId: userId };

    const leases = await prisma.lease.findMany({
      where: whereClause,
      include: {
        tenant: { select: { id: true, name: true, email: true, phoneNumber: true } },
        property: { include: { location: true } },
      },
      orderBy: { startDate: "desc" },
    });

    res.json(leases);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving leases: ${error.message}` });
  }
};

export const getLeasePayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
      orderBy: { dueDate: "desc" },
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving lease payments: ${error.message}` });
  }
};
