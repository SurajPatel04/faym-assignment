export const createAdvance = async (tx, sale, amount) => {
    return await tx.payoutTransaction.create({
        data: {
            userId: sale.userId,
            saleId: sale.id,
            type: "ADVANCE",
            amount: amount,
            status: "SUCCESS",
        },
    });
};

export const createFinal = async (tx, sale, amount) => {
    return await tx.payoutTransaction.create({
        data: {
            userId: sale.userId,
            saleId: sale.id,
            type: "FINAL",
            amount: amount,
            status: "SUCCESS",
        },
    });
};

export const createAdjustment = async (tx, sale, amount) => {
    return await tx.payoutTransaction.create({
        data: {
            userId: sale.userId,
            saleId: sale.id,
            type: "ADJUSTMENT",
            amount: amount,
            status: "SUCCESS",
        },
    });
};

export const createRefund = async (tx, withdrawal) => {
    return await tx.payoutTransaction.create({
        data: {
            userId: withdrawal.userId,
            type: "REFUND",
            amount: withdrawal.amount,
            status: "SUCCESS",
            referenceId: withdrawal.id,
        },
    });
};
