import { TransactionController } from "../transaction.controller";
import { TransactionService } from "../../services/transaction.service";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

jest.mock("../../services/transaction.service");

const mockTransactionService = TransactionService as jest.MockedClass<
  typeof TransactionService
>;

describe("TransactionController", () => {
  let controller: TransactionController;
  let mockReq: Partial<Request & { user?: { id: string; email: string } }>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    controller = new TransactionController();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return transactions", async () => {
      const mockResult = { transactions: [], balance: new Prisma.Decimal(0) };
      mockTransactionService.prototype.getAll.mockResolvedValue(mockResult);

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(mockTransactionService.prototype.getAll).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle errors", async () => {
      mockTransactionService.prototype.getAll.mockRejectedValue(
        new Error("DB error"),
      );

      await controller.getAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ msg: "Server error" });
    });
  });

  describe("create", () => {
    it("should create transaction", async () => {
      const mockUser = { id: "1", email: "user@example.com" };
      const mockBody = { type: "income", category: "salary", amount: 100 };
      const mockResult = {
        msg: "Added",
        transaction: {} as any,
        balance: new Prisma.Decimal(100),
      };
      mockReq = { user: mockUser, body: mockBody };
      mockTransactionService.prototype.create.mockResolvedValue(mockResult);

      await controller.create(mockReq as Request, mockRes as Response);

      expect(mockTransactionService.prototype.create).toHaveBeenCalledWith({
        ...mockBody,
        userId: mockUser.id,
        userEmail: mockUser.email,
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it("should return unauthorized if no user", async () => {
      mockReq = { body: {} };

      await controller.create(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ msg: "Unauthorized" });
    });

    it("should handle errors", async () => {
      const mockUser = { id: "1", email: "user@example.com" };
      mockReq = { user: mockUser, body: {} };
      mockTransactionService.prototype.create.mockRejectedValue(
        new Error("Error"),
      );

      await controller.create(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ msg: "Server error" });
    });
  });
});
