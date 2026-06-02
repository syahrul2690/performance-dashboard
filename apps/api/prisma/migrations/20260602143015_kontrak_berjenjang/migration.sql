-- AlterTable
ALTER TABLE "kontrak_manajemen" ADD COLUMN     "currentStage" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "history" JSONB NOT NULL DEFAULT '[]';
