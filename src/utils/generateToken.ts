import { Response } from "express";
import jwt from "jsonwebtoken";

const generateToken = (res: Response, userId: string) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000, 
  });
  return token;
};

export default generateToken;