/*
  Warnings:

  - You are about to drop the `OrderAttachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OrderAttachments" DROP CONSTRAINT "OrderAttachments_orderId_fkey";

-- AlterTable
ALTER TABLE "public"."Orders" ADD COLUMN     "attachments" TEXT[];

-- DropTable
DROP TABLE "public"."OrderAttachments";
