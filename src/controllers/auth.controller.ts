import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const result = await authService.signup(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.message === "User exists") {
        res.status(400).json({ msg: err.message });
      } else {
        res.status(500).json({ msg: "Server error" });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.message === "Invalid credentials") {
        res.status(400).json({ msg: err.message });
      } else {
        res.status(500).json({ msg: "Server error" });
      }
    }
  }
}
