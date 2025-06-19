/*
  Warnings:

  - The `values` column on the `product_options` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "product_options" DROP COLUMN "values",
ADD COLUMN     "values" TEXT[];
