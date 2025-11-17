/*
  Warnings:

  - You are about to drop the `Voucher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Orders" DROP CONSTRAINT "Orders_voucherId_fkey";

-- DropTable
DROP TABLE "public"."Voucher";

-- CreateTable
CREATE TABLE "public"."Vouchers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."DiscountType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "maxDiscount" DECIMAL(65,30) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vouchers_code_key" ON "public"."Vouchers"("code");

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."Vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
