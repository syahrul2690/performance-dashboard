-- DropIndex
DROP INDEX "kontrak_manajemen_periodId_unitCode_key";

-- AlterTable
ALTER TABLE "kontrak_manajemen" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewer" TEXT,
ADD COLUMN     "submitterId" TEXT;

-- CreateIndex
CREATE INDEX "kontrak_manajemen_periodId_unitCode_idx" ON "kontrak_manajemen"("periodId", "unitCode");
