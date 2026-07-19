import prisma from "../config/db.js";
import { ADVANCE_PERCENTAGE } from "../constants/payout.constants.js";
import { createAdvance } from "./payoutTransaction.service.js";

export const runAdvancePayouts = async () => {

    const eligibleSales = await prisma.sale.findMany({
        where: {
            status: "PENDING",
            advancePaid: false,
        },
    });

    const results = {
        processed: [],
        skipped: [],
        totalAdvancePaid: 0,
    };

    for (const sale of eligibleSales) {
        try {
            const result = await prisma.$transaction(async (tx) => {
                const advanceAmount = Number(sale.earning) * ADVANCE_PERCENTAGE;

                const updateResult = await tx.sale.updateMany({
                    where: {
                        id: sale.id,
                        status: "PENDING",
                        advancePaid: false
                    },
                    data: {
                        advancePaid: true,
                        advanceAmount: advanceAmount,
                    },
                });

                if (updateResult.count === 0) {
                    return null;
                }

                const transaction = await createAdvance(tx, sale, advanceAmount);

                await tx.user.update({
                    where: { id: sale.userId },
                    data: { withdrawableBalance: { increment: advanceAmount } },
                });

                return { saleId: sale.id, advanceAmount, transactionId: transaction.id };
            });

            if (result) {
                results.processed.push(result);
                results.totalAdvancePaid += result.advanceAmount;
            } else {
                results.skipped.push({ saleId: sale.id, reason: "No longer eligible" });
            }
        } catch (error) {
            results.skipped.push({ saleId: sale.id, reason: error.message });
        }
    }

    return results;
};
