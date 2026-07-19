import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import * as withdrawalService from "../services/withdrawal.service.js";
import { ALLOWED_WEBHOOK_STATUSES } from "../constants/webhook.constants.js";


export const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    const withdrawal = await withdrawalService.requestWithdrawal(req.user.id, amount);

    res.status(201).json(new ApiResponse(201, withdrawal, "Withdrawal requested successfully"));
});

export const paymentWebhook = asyncHandler(async (req, res) => {
    const { withdrawalId, status, gatewayReference, gatewayResponse } = req.body;

    if (!withdrawalId || !status) {
        throw new ApiError(400, "withdrawalId and status are required");
    }

    if (!ALLOWED_WEBHOOK_STATUSES.includes(status)) {
        throw new ApiError(400, "Invalid webhook status");
    }

    const result = await withdrawalService.processWebhook(
        withdrawalId,
        status,
        gatewayReference,
        gatewayResponse
    );

    res.status(200).json(
        new ApiResponse(200, result, "Webhook processed successfully.")
    );
});
