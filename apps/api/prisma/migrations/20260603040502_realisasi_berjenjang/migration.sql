-- AlterTable
ALTER TABLE "input_realisasi" ADD COLUMN     "currentStage" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "history" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewer" TEXT,
ADD COLUMN     "submitterId" TEXT;
