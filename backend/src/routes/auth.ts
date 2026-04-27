import { Router } from "express";
import { z } from "zod";

export const authRouter = Router();

const sendOtpSchema = z.object({
  phone: z.string().min(10)
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().min(4)
});

// Placeholder endpoints: provider integration can be added later.
authRouter.post("/send-otp", (req, res) => {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  return res.json({
    success: true,
    message: "OTP send route ready. Integrate provider env later."
  });
});

authRouter.post("/verify-otp", (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // Dev-friendly stub. Replace with provider/session verification.
  return res.json({
    success: true,
    token: "dev-token-placeholder"
  });
});
