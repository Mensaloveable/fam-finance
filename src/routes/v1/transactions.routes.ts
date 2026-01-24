import { Router, Request } from "express";
import prisma from "../../lib/prisma.js";
import { auth } from "../../middleware/auth.js";

interface AuthRequest extends Request {
  user?: { id: string; email: string }; // From middleware
}

interface AddBody {
  type: "income" | "expense";
  category: string;
  amount: number;
}

const router = Router();

// Get all + balance
router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });

    const incomeAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "income" },
    });

    const expenseAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "expense" },
    });

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const balance = totalIncome - totalExpense;

    await prisma.user.updateMany({
      data: { balance },
    });

    res.json({ transactions, balance });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Add transaction
router.post("/", auth, async (req: AuthRequest, res) => {
  const { type, category, amount }: AddBody = req.body;
  try {
    const transaction = await prisma.transaction.create({
      data: {
        type,
        category,
        amount,
        addedBy: req.user?.email || "unknown",
        userId: req.user?.id || "", // Assuming we have a user
      },
    });

    // Re-compute balance
    const incomeAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "income" },
    });

    const expenseAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "expense" },
    });

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const balance = totalIncome - totalExpense;

    await prisma.user.updateMany({
      data: { balance },
    });

    res.json({ msg: "Added", transaction, balance });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
