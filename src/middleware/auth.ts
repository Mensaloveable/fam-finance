import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

interface AuthRequest extends Request {
  user?: any; // User without password
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
      },
    });
    if (!user) return res.status(401).json({ msg: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
