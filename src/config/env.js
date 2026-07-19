import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
  "DATABASE_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`FATAL: Environment variable ${varName} is not set.`);
    process.exit(1);
  }
}

const accessTokenTTL = process.env.ACCESS_TOKEN_TTL || "15m";
const refreshTokenTTL = process.env.REFRESH_TOKEN_TTL || "7d";

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  databaseUrl: process.env.DATABASE_URL,

  accessTokenSecret: {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: accessTokenTTL,
  },
  refreshTokenSecret: {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: refreshTokenTTL,
  },
};
