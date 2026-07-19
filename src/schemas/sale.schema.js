import { z } from "zod";

export const createSaleSchema = z.object({
    brand: z.string().min(1, "Brand is required"),
    earning: z.number().positive("Earning must be a positive number"),
});

export const updateSaleStatusSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"], {
        errorMap: () => ({ message: "Status must be APPROVED or REJECTED" }),
    }),
});
