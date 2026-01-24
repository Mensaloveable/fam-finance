import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service.js";

const transactionService = new TransactionService();

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export class TransactionController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const result = await transactionService.getAll();
      res.json(result);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      const result = await transactionService.create({
        ...req.body,
        userId: req.user.id,
        userEmail: req.user.email,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  }
}
