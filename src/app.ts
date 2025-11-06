import express, { Request, Response } from "express";

const app = express();
const port: number = 3000;

// GET /
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});