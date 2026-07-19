import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import * as advanceService from "../services/advance.service.js";

export const runAdvancePayouts = asyncHandler(async (req, res) => {
    const results = await advanceService.runAdvancePayouts();

    res.status(200).json(
        new ApiResponse(200, results, `Advance payouts processed. ${results.processed.length} paid, ${results.skipped.length} skipped.`)
    );
});
