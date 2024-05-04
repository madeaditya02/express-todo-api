import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const generateAccessToken = (payload: object) => {
  return jwt.sign({ payload }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "8h",
  });
};

const generateRefreshToken = (payload: object) => {
  return jwt.sign({ payload }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "8h",
  });
};

export const generateTokens = (payload: object) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
};