# FamFinance Backend

A TypeScript-based backend for managing family finances, now powered by PostgreSQL and Prisma.

## Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=5001
   DATABASE_URL="postgresql://user:password@localhost:5432/fam_finance?schema=public"
   JWT_SECRET=your-secret-key
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication

#### 1. Signup

Create a new user account.

- **URL:** `/api/v1/auth/signup`
- **Method:** `POST`
- **Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }
  ```
- **Success Response:**
  ```json
  {
    "token": "ey...",
    "user": {
      "id": "uuid-...",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

#### 2. Login

Authenticate an existing user.

- **URL:** `/api/v1/auth/login`
- **Method:** `POST`
- **Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response:**
  ```json
  {
    "token": "ey...",
    "user": {
      "id": "uuid-...",
      "email": "user@example.com",
      "name": "John Doe",
      "balance": 0
    }
  }
  ```

---

### Transactions (Authenticated)

_All transaction endpoints require a `Authorization: Bearer <token>` header._

#### 3. Get Transactions & Balance

Fetch all transactions and the current total balance.

- **URL:** `/api/v1/transactions`
- **Method:** `GET`
- **Success Response:**
  ```json
  {
    "transactions": [
      {
        "id": "uuid-...",
        "type": "income",
        "category": "Salary",
        "amount": 5000,
        "date": "2024-01-24T12:00:00.000Z",
        "addedBy": "user@example.com"
      }
    ],
    "balance": 5000
  }
  ```

#### 4. Add Transaction

Record a new income or expense.

- **URL:** `/api/v1/transactions`
- **Method:** `POST`
- **Payload:**
  ```json
  {
    "type": "expense",
    "category": "Groceries",
    "amount": 150
  }
  ```
- **Success Response:**
  ```json
  {
    "msg": "Added",
    "transaction": {
      "id": "uuid-...",
      "type": "expense",
      "category": "Groceries",
      "amount": 150,
      "date": "2024-01-24T12:10:00.000Z",
      "addedBy": "user@example.com",
      "userId": "uuid-..."
    },
    "balance": 4850
  }
  ```
