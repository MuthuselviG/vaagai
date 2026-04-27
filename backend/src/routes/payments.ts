import { Router } from "express";
import Razorpay from "razorpay";
import { z } from "zod";
import { env } from "../config/env.js";

export const paymentsRouter = Router();

const createOrderSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().default("INR"),
  receipt: z.string().optional()
});

paymentsRouter.post("/create-order", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid order payload" });
  }

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      error: "Razorpay not configured",
      hint: "Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env"
    });
  }

  const razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
  });

  try {
    const order = await razorpay.orders.create({
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      receipt: parsed.data.receipt
    });
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create order" });
  }
});
