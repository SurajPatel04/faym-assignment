import { z } from "zod";

export const createWithdrawalSchema = z.object({
    amount: z.number().positive("Withdrawal amount must be positive").max(1000000, "Maximum withdrawal is ₹1,000,000"),
});
