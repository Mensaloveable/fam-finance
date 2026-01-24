import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

interface SignupBody {
  email: string;
  password: string;
  name: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const router = Router();

// Signup
router.post("/signup", async (req, res) => {
  const { email, password, name }: SignupBody = req.body;
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) return res.status(400).json({ msg: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    res.json({ token, user: { id: user.id, email, name } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password }: LoginBody = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    res.json({
      token,
      user: { id: user.id, email, name: user.name, balance: user.balance },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
