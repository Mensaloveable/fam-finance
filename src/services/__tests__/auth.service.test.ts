import { AuthService } from '../auth.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      const data = { email: 'test@example.com', password: 'password', name: 'Test User' };
      const hashedPassword = 'hashed';
      const mockUser = { id: '1', email: data.email, name: data.name, password: hashedPassword };
      const token = 'jwt-token';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = await service.signup(data);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: data.email } });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(data.password, 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
      });
      expect(mockJwt.sign).toHaveBeenCalledWith({ id: mockUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      expect(result).toEqual({
        token,
        user: { id: mockUser.id, email: data.email, name: data.name },
      });
    });

    it('should throw error if user exists', async () => {
      const data = { email: 'test@example.com', password: 'password', name: 'Test User' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: data.email });

      await expect(service.signup(data)).rejects.toThrow('User exists');
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const data = { email: 'test@example.com', password: 'password' };
      const mockUser = { id: '1', email: data.email, name: 'Test User', password: 'hashed', balance: new (await import('@prisma/client')).Prisma.Decimal(0) };
      const token = 'jwt-token';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = await service.login(data);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: data.email } });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(data.password, mockUser.password);
      expect(mockJwt.sign).toHaveBeenCalledWith({ id: mockUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      expect(result).toEqual({
        token,
        user: { id: mockUser.id, email: data.email, name: mockUser.name, balance: mockUser.balance },
      });
    });

    it('should throw error for invalid credentials', async () => {
      const data = { email: 'test@example.com', password: 'password' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(data)).rejects.toThrow('Invalid credentials');
    });
  });
});