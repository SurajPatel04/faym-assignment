import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import * as saleService from "../services/sale.service.js";


export const createSale = asyncHandler(async (req, res) => {
    const { brand, earning } = req.body;
    const sale = await saleService.createSale(req.user.id, { brand, earning });

    res.status(201).json(new ApiResponse(201, sale, "Sale created successfully"));
});

export const getSales = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const { page, limit } = req.pagination;

    const result = await saleService.getSalesByUser(req.user.id, {
        status: status?.toUpperCase(),
        page,
        limit,
    });

    res.status(200).json(new ApiResponse(200, result, "Sales retrieved successfully"));
});

export const updateSaleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const result = await saleService.reconcileSale(id, status);

    res.status(200).json(new ApiResponse(200, result, `Sale ${status.toLowerCase()} successfully`));
});
