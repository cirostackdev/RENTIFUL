import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";

function generateToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name, phoneNumber, role } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ message: "Email, password, name, and role are required" });
      return;
    }

    if (!["tenant", "manager"].includes(role)) {
      res.status(400).json({ message: "Role must be 'tenant' or 'manager'" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        name,
        phoneNumber: phoneNumber || "",
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: `Registration failed: ${error.message}` });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: `Login failed: ${error.message}` });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to fetch user: ${error.message}` });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phoneNumber } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phoneNumber: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: `Update failed: ${error.message}` });
  }
};
