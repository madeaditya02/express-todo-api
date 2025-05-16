import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { z } from "zod";
import { generateTokens } from "../utils/jwt";
import validator from "validator";
import { Token } from "../entity/user.entity";
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const userSchema = z.object({
  username: z.string().toLowerCase(),
  password: z.string().min(8),
  name: z.string(),
  email: z.string().refine(validator.isEmail, {
    message: "Please provide a valid email address!"
  }),
  address: z.string(),
  phone: z.string().refine(validator.isMobilePhone, {
    message: "Please provide a valid phone number!"
  })
})

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, name, email, address, phone } = req.body
    const parsedUser = userSchema.parse({
      username, password, name, email, address, phone
    })

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(parsedUser.password, saltRounds);
    await prisma.users.create({
      data: {
        username: parsedUser.username,
        password: hashedPassword,
        name: parsedUser.name,
        email: parsedUser.email,
        address: parsedUser.address,
        phone: parsedUser.phone
      },
    });
    res
      .status(201)
      .json({ message: "Registration success!" });
  } catch (err: any) {
    if (err.code == "P2002") {
      res
        .status(400)
        .json({ message: "Username or email already registered. Please try again" });
      return;
    } else if (err.name == "ZodError") {
      res
        .status(400)
        .json(err.issues);
      return;
    }
    console.log(err);
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body
  try {
    const user = await prisma.users.findFirst({
      where: {
        username: username,
      },
    });
    if (!user) {
      res
        .status(404)
        .json({
          message:
            "The credentials you provided doesn't match our records. Please try again",
        });
      return;
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      res
        .status(400)
        .json({
          message:
            "The credentials you provided doesn't match our records. Please try again",
        });
      return;
    }

    const { accessToken } = generateTokens({
      id: user.id,
      username: user.username,
    });

    res.status(200).json({ token: accessToken });
  } catch (err: any) {
    res.status(500).json({ message: "Something went wrong..." });
  }
};

export const user = (req: Request, res: Response) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const verifyToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as Token;
    const user = verifyToken.payload;
    res.json(user);
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}