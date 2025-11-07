import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./db.js";
import todoRoutes from "./routes/todo.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend URL
  credentials: true
}));


// GET /
app.use("/tasks", todoRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Convert PORT to number, fallback to 4000
const port: number = parseInt(process.env.PORT || "4000", 10);
// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});