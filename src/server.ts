import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
