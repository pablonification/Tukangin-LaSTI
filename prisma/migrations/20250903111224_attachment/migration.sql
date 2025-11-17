/*
  Warnings:

  - Added the required column `receiverPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "receiverPhone" TEXT NOT NULL;
