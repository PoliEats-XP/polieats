-- AlterTable
ALTER TABLE "order" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "feedbackAt" TIMESTAMP(3),
ADD COLUMN     "rating" INTEGER;
