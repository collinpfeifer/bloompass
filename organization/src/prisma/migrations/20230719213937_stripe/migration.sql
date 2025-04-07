/*
  Warnings:

  - You are about to drop the column `balance` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "balance";
ALTER TABLE "Organization" ADD COLUMN     "onboardingComplete" BOOL NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN     "stripeAccountId" STRING;
