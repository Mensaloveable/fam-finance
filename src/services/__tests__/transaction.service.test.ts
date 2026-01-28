import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import { TransactionService } from "../transaction.service.js";

jest.mock("../../lib/prisma", () => ({
  __esModule: true,
  default: {
    transaction: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
    },
    user: {
      updateMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("TransactionService", () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return transactions and balance", async () => {
      const mockTransactions = [
        {
          id: "1",
          type: "income",
          amount: new Prisma.Decimal(100),
          date: new Date(),
        },
      ];
      const mockIncomeAgg = { _sum: { amount: new Prisma.Decimal(100) } };
      const mockExpenseAgg = { _sum: { amount: new Prisma.Decimal(50) } };

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prisma.transaction.aggregate as jest.Mock)
        .mockResolvedValueOnce(mockIncomeAgg)
        .mockResolvedValueOnce(mockExpenseAgg);
      (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.getAll();

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        orderBy: { date: "desc" },
      });
      expect(mockPrisma.transaction.aggregate).toHaveBeenCalledTimes(2);
      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        data: { balance: new Prisma.Decimal(50) },
      });
      expect(result).toEqual({
        transactions: mockTransactions,
        balance: new Prisma.Decimal(50),
      });
    });
  });

  describe("create", () => {
    it("should create a transaction and return result", async () => {
      const mockTransaction = {
        id: "1",
        type: "income",
        category: "salary",
        amount: new Prisma.Decimal(100),
        addedBy: "user@example.com",
        userId: "user1",
        date: new Date(),
      };
      const mockBalance = new Prisma.Decimal(100);

      (prisma.transaction.create as jest.Mock).mockResolvedValue(
        mockTransaction,
      );
      // Mock getAll to return balance
      jest
        .spyOn(service, "getAll")
        .mockResolvedValue({ transactions: [], balance: mockBalance });

      const data = {
        type: "income" as const,
        category: "salary",
        amount: 100,
        userId: "user1",
        userEmail: "user@example.com",
      };

      const result = await service.create(data);

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          type: "income",
          category: "salary",
          amount: 100,
          addedBy: "user@example.com",
          userId: "user1",
        },
      });
      expect(result).toEqual({
        msg: "Added",
        transaction: mockTransaction,
        balance: mockBalance,
      });
    });
  });
});
