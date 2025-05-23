-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "paymentMethod" "PaymentMethod";
