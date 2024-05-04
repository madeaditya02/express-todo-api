import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUser, Token } from "../entity/user.entity";

export function authMiddleware(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const verifyToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as Token;
      req.user = verifyToken.payload;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err: any) {
    res.status(400).json({ message: "Wrong authentication token!" });
  }
}
