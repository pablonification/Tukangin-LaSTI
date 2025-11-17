/*
  Warnings:

  - You are about to drop the column `discount_type` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `discount_value` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `expiry_date` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `max_discount` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `usage_limit` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `used_count` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `user_limit` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tukang` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isActive` to the `Voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxDiscount` to the `Voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Voucher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_tukangId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_voucherId_fkey";

-- AlterTable
ALTER TABLE "public"."Voucher" DROP COLUMN "discount_type",
DROP COLUMN "discount_value",
DROP COLUMN "expiry_date",
DROP COLUMN "is_active",
DROP COLUMN "max_discount",
DROP COLUMN "usage_limit",
DROP COLUMN "used_count",
DROP COLUMN "user_limit",
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL,
ADD COLUMN     "maxDiscount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "type" "public"."DiscountType" NOT NULL,
ADD COLUMN     "usageLimit" INTEGER,
ADD COLUMN     "value" DECIMAL(65,30) NOT NULL;

-- DropTable
DROP TABLE "public"."Order";

-- DropTable
DROP TABLE "public"."Tukang";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "image" TEXT,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Suspensions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "until" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suspensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Orders" (
    "id" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "receiverPhone" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "subtotal" INTEGER,
    "discount" INTEGER,
    "total" INTEGER,
    "userId" TEXT NOT NULL,
    "voucherId" INTEGER,
    "professionalId" TEXT,
    "rating" DECIMAL(65,30),

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderAttachments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,

    CONSTRAINT "OrderAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Professionals" (
    "userId" TEXT NOT NULL,
    "speciality" TEXT,
    "alamat" TEXT NOT NULL,
    "nikNumber" TEXT NOT NULL,
    "idCardPicture" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Professionals_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Professionals_nikNumber_key" ON "public"."Professionals"("nikNumber");

-- AddForeignKey
ALTER TABLE "public"."Suspensions" ADD CONSTRAINT "Suspensions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "public"."Professionals"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderAttachments" ADD CONSTRAINT "OrderAttachments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Professionals" ADD CONSTRAINT "Professionals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
