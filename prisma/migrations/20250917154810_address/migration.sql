/*
  Warnings:

  - You are about to drop the column `location` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Users" DROP COLUMN "location",
ADD COLUMN     "address" TEXT;
