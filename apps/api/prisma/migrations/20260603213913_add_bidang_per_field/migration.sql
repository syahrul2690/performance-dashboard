-- AlterTable: User mendapat kolom bidang (nullable; GM/lintas-bidang = NULL)
ALTER TABLE "users" ADD COLUMN "bidang" TEXT;

-- AlterTable: Realisasi dipecah per bidang
ALTER TABLE "input_realisasi" ADD COLUMN "bidang" TEXT NOT NULL DEFAULT '';

-- DropIndex: unique lama (periodId, unitCode)
DROP INDEX "input_realisasi_periodId_unitCode_key";

-- CreateIndex: unique baru (periodId, unitCode, bidang)
CREATE UNIQUE INDEX "input_realisasi_periodId_unitCode_bidang_key" ON "input_realisasi"("periodId", "unitCode", "bidang");
