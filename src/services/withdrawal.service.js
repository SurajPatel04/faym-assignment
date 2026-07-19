import prisma from "../config/db.js";
import { ApiError } from "../utils/apiError.utils.js";
import { TWENTY_FOUR_HOURS_MS } from "../constants/payout.constants.js";
import { FAILED_WEBHOOK_STATUSES } from "../constants/webhook.constants.js";
import { createRefund } from "./payoutTransaction.service.js";

export const requestWithdrawal = async (userId, amount) => {
    return await prisma.$transaction(async (tx) => {

        const user = await tx.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.lastWithdrawalAt) {
            const timeSinceLastWithdrawal = Date.now() - new Date(user.lastWithdrawalAt).getTime();
            if (timeSinceLastWithdrawal < TWENTY_FOUR_HOURS_MS) {
                const nextAllowedAt = new Date(new Date(user.lastWithdrawalAt).getTime() + TWENTY_FOUR_HOURS_MS);
                throw new ApiError(429, `Withdrawal allowed only once every 24 hours. Try again after ${nextAllowedAt.toISOString()}`);
            }
        }

        if (Number(user.withdrawableBalance) < amount) {
            throw new ApiError(400, `Insufficient balance. Available: ₹${Number(user.withdrawableBalance).toFixed(2)}, Requested: ₹${amount.toFixed(2)}`);
        }

        await tx.user.update({
            where: { id: userId },
            data: {
                withdrawableBalance: { decrement: amount },
                lastWithdrawalAt: new Date(),
            },
        });

        const withdrawal = await tx.withdrawal.create({
            data: {
                userId,
                amount,
                status: "PENDING",
            },
        });

        return withdrawal;
    });
};

export const processWebhook = async (withdrawalId, webhookStatus, gatewayReference, gatewayResponse) => {
    return await prisma.$transaction(async (tx) => {

        const withdrawal = await tx.withdrawal.findUnique({
            where: { id: withdrawalId },
        });

        if (!withdrawal) {
            throw new ApiError(404, "Withdrawal not found");
        }

        if (withdrawal.status !== "PENDING") {
            throw new ApiError(409, `Withdrawal is already ${withdrawal.status}. Cannot process webhook.`);
        }


        const updatedWithdrawal = await tx.withdrawal.update({
            where: { id: withdrawalId },
            data: {
                status: webhookStatus,
                processedAt: new Date(),
                gatewayReference: gatewayReference || null,
                gatewayResponse: gatewayResponse || null,
            },
        });

        let refundTransaction = null;


        if (FAILED_WEBHOOK_STATUSES.includes(webhookStatus)) {
            refundTransaction = await createRefund(tx, withdrawal);

            await tx.user.update({
                where: { id: withdrawal.userId },
                data: {
                    withdrawableBalance: { increment: withdrawal.amount },
                    lastWithdrawalAt: null,
                },
            });
        }

        return { withdrawal: updatedWithdrawal, refundTransaction };
    });
};
