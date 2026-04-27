import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { paymentsRouter } from "./routes/payments.js";
import { practiceRouter } from "./routes/practice.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "TNPSC portal backend running" });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/practice", practiceRouter);
app.use("/api/payments", paymentsRouter);

app.listen(Number(env.PORT), () => {
  // Keep a minimal startup log for local debugging.
  console.log(`API listening on http://localhost:${env.PORT}`);
});
