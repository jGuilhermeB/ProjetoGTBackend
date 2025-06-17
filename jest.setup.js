require('dotenv').config();

// Mock do Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    category: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn()
    },
    product: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn()
    },
    order: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn()
    },
    orderItem: {
      create: jest.fn(),
      deleteMany: jest.fn()
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient))
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Mock do JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'test-token'),
  verify: jest.fn((token, secret, callback) => {
    if (token === 'invalid-token') {
      callback(new Error('Invalid token'));
    } else {
      callback(null, { id: 1 });
    }
  })
})); 