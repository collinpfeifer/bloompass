-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "sold" BOOL NOT NULL DEFAULT false;
ALTER TABLE "Ticket" ADD COLUMN     "soldAt" TIMESTAMP(3);
