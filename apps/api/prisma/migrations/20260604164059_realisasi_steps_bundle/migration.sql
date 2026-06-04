-- InputRealisasi: mesin alur berbasis langkah
ALTER TABLE "input_realisasi" ADD COLUMN "steps" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "input_realisasi" ADD COLUMN "currentStepIndex" INTEGER NOT NULL DEFAULT 0;

-- Dokumen konsolidasi realisasi per periode (persetujuan GM sekali)
CREATE TABLE "realisasi_bundles" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reviewer" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "realisasi_bundles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "realisasi_bundles_periodId_key" ON "realisasi_bundles"("periodId");
