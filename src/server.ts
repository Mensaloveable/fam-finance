import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import v1Routes from "./routes/v1/index.js";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1", v1Routes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
