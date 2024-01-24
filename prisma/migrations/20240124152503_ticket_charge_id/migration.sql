/*
  Warnings:

  - You are about to drop the column `pendingChargeIds` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "chargeId" STRING;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "pendingChargeIds";
