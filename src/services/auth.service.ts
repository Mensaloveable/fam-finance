import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

interface SignupDto {
  email: string;
  password: string;
  name: string;
}

interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  async signup(data: SignupDto) {
    const { email, password, name } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    return { token, user: { id: user.id, email, name } };
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    return {
      token,
      user: { id: user.id, email, name: user.name, balance: user.balance },
    };
  }
}
