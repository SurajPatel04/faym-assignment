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

export const refreshAuthTokens = async (refreshTokenString, req) => {
    try {
        const decoded = jwt.verify(refreshTokenString, env.refreshTokenSecret.secret);
        const hashedToken = hashToken(refreshTokenString);

        const tokenRecord = await prisma.refreshToken.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });

        if (!tokenRecord) {
            throw new Error("Refresh token not found");
        }

        if (tokenRecord.isRevoked) {
            await prisma.refreshToken.updateMany({
                where: { userId: decoded.userId },
                data: { isRevoked: true },
            });
            throw new Error("Compromised refresh token. All sessions revoked.");
        }

        if (new Date() > tokenRecord.expiresAt) {
            throw new Error("Refresh token expired");
        }

        await prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { isRevoked: true },
        });

        return await generateAuthTokens(tokenRecord.user, req);
    } catch (error) {
        throw new Error(error.message || "Invalid refresh token");
    }
};

export const logoutUser = async (refreshTokenString) => {
    const hashedToken = hashToken(refreshTokenString);
    await prisma.refreshToken.updateMany({
        where: { token: hashedToken },
        data: { isRevoked: true },
    });
};

export const cleanupExpiredTokens = async () => {
    return await prisma.refreshToken.deleteMany({
        where: {
            OR: [
                { expiresAt: { lt: new Date() } },
                { isRevoked: true },
            ],
        },
    });
};