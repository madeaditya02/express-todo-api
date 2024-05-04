/*
  Warnings:

  - You are about to drop the column `jwtRefreshToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "jwtRefreshToken";
