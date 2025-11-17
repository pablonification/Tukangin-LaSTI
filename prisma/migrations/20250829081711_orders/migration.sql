-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'DEVELOPER';

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "phone" TEXT;
