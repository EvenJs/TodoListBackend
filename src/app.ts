import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

dotenv.config();
connectDB();

const app = express();

// Convert PORT to number, fallback to 4000
const port: number = parseInt(process.env.PORT || "4000", 10);

// GET /
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});