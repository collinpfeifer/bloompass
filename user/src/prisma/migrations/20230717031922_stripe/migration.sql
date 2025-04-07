/*
  Warnings:

  - You are about to drop the column `balance` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "balance";
ALTER TABLE "User" ADD COLUMN     "onboardingComplete" BOOL NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN     "stripeAccountId" STRING;
