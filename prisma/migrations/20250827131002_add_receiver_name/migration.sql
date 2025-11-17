/*
  Warnings:

  - Added the required column `receiverName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENT', 'FLAT');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "discount" DECIMAL(65,30),
ADD COLUMN     "receiverName" TEXT NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(65,30),
ADD COLUMN     "total" DECIMAL(65,30),
ADD COLUMN     "voucherId" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "image" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."Voucher" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "public"."DiscountType" NOT NULL,
    "discount_value" DECIMAL(65,30) NOT NULL,
    "max_discount" DECIMAL(65,30) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "user_limit" INTEGER,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "public"."Voucher"("code");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
