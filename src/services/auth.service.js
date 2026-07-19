import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../config/db.js";
import { hashToken } from "../utils/hash.utils.js";
import ms from "ms";

export const generateAccessToken = (user) => {
    const secret = env.accessTokenSecret.secret;
    const expiresIn = env.accessTokenSecret.expiresIn;
    if (!secret) {
        throw new Error("Access token secret is not defined in environment variables.");
    }
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, secret, { expiresIn });
}

export const generateRefreshToken = (user) => {
    const secret = env.refreshTokenSecret.secret;
    const expiresIn = env.refreshTokenSecret.expiresIn;
    if (!secret) {
        throw new Error("Refresh token secret is not defined in environment variables.");
    }

    const payload = {
        userId: user.id,
    }

    const options = {
        expiresIn,
    }

    return jwt.sign(payload, secret, options);
}

export const generateRefreshTokenAndStore = async (user, req) => {
    const refreshToken = generateRefreshToken(user);
    const expireAt = new Date(Date.now() + ms(env.refreshTokenSecret.expiresIn));

    const deviceInfo = req?.headers?.["user-agent"] || null;
    const ipAddress = req?.ip || null;

    const hashedToken = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
        where: {
            userId: user.id,
            deviceInfo: deviceInfo,
        },
        data: {
            isRevoked: true,
        }
        ,
    })

    await prisma.refreshToken.create({
        data: {
            token: hashedToken,
            userId: user.id,
            expiresAt: expireAt,
            deviceInfo,
            ipAddress,
        }
    });

    return refreshToken;

}

export const generateAuthTokens = async (user, req) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshTokenAndStore(user, req);
    return { accessToken, refreshToken };
}