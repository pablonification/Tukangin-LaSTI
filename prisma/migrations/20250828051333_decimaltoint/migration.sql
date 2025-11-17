/*
  Warnings:

  - You are about to alter the column `discount_value` on the `Voucher` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `max_discount` on the `Voucher` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."Voucher" ALTER COLUMN "discount_value" SET DATA TYPE INTEGER,
ALTER COLUMN "max_discount" SET DATA TYPE INTEGER;
