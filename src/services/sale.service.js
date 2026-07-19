import prisma from "../config/db.js";
import { ApiError } from "../utils/apiError.utils.js";
import { createFinal, createAdjustment } from "./payoutTransaction.service.js";


export const createSale = async (userId, { brand, earning }) => {
    const sale = await prisma.sale.create({
        data: {
            userId,
            brand,
            earning,
            status: "PENDING",
        },
    });
    return sale;
};

export const getSalesByUser = async (userId, { status, page = 1, limit = 20 } = {}) => {
    const where = { userId };
    if (status) where.status = status;

    const [sales, total] = await Promise.all([
        prisma.sale.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                payoutTransactions: {
                    orderBy: { createdAt: "desc" },
                },
            },
        }),
        prisma.sale.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
        sales,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
};

export const reconcileSale = async (saleId, newStatus) => {
    return await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({ where: { id: saleId } });

        if (!sale) {
            throw new ApiError(404, "Sale not found");
        }

        const updateResult = await tx.sale.updateMany({
            where: { id: saleId, status: "PENDING" },
            data: {
                status: newStatus,
                reconciledAt: new Date(),
            },
        });

        if (updateResult.count === 0) {
            throw new ApiError(409, `Sale is already reconciled or not pending.`);
        }

        const updatedSale = await tx.sale.findUnique({ where: { id: saleId } });

        let transaction;

        if (newStatus === "APPROVED") {
            const remainingAmount = Number(sale.earning) - Number(sale.advanceAmount);

            transaction = await createFinal(tx, sale, remainingAmount);

            await tx.user.update({
                where: { id: sale.userId },
                data: { withdrawableBalance: { increment: remainingAmount } },
            });
        } else if (newStatus === "REJECTED") {
            if (sale.advancePaid && Number(sale.advanceAmount) > 0) {
                transaction = await createAdjustment(tx, sale, -Number(sale.advanceAmount));

                await tx.user.update({
                    where: { id: sale.userId },
                    data: { withdrawableBalance: { decrement: sale.advanceAmount } },
                });
            }
        }

        return { sale: updatedSale, transaction };
    });
};
