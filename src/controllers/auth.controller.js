import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
            role: "USER",
        },
    });

    res.status(201).json(new ApiResponse(201, { user: { id: user.id, username: user.username, email: user.email, role: user.role } }, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await authService.generateAuthTokens(user, req);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // Strict is not enabled
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json(new ApiResponse(200, { user: { id: user.id, username: user.username, email: user.email, role: user.role } }, "Login successful"));
});


export const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is missing from cookies");
    }

    try {
        const tokens = await authService.refreshAuthTokens(refreshToken, req);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        res.cookie("accessToken", tokens.accessToken, cookieOptions);
        res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

        res.status(200).json(new ApiResponse(200, null, "Tokens refreshed successfully"));
    } catch (error) {
        throw new ApiError(401, error.message);
    }
});


export const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
        await authService.logoutUser(refreshToken);
    }

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});
