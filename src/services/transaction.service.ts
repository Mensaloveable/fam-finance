import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";

interface CreateTransactionDto {
  type: "income" | "expense";
  category: string;
  amount: number;
  userId: string;
  userEmail: string;
}

export class TransactionService {
  async getAll() {
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

    const totalIncome = incomeAgg._sum.amount?.toString() || "0";
    const totalExpense = expenseAgg._sum.amount?.toString() || "0";
    const balance = new Prisma.Decimal(totalIncome).minus(
      new Prisma.Decimal(totalExpense),
    );

    // Update balance for all users - this seems to be the existing logic,
    // though arguably it should only update the specific user.
    // Stick to existing behavior for now as per instructions to refactor not change logic.
    await prisma.user.updateMany({
      data: { balance },
    });

    return { transactions, balance };
  }

  async create(data: CreateTransactionDto) {
    const { type, category, amount, userId, userEmail } = data;

    const transaction = await prisma.transaction.create({
      data: {
        type,
        category,
        amount,
        addedBy: userEmail,
        userId: userId,
      },
    });

    // Re-compute balance
    const { balance } = await this.getAll();

    return { msg: "Added", transaction, balance };
  }
}
