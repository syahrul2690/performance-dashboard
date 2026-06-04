-- KontrakManajemen: mesin alur berbasis langkah (sama seperti realisasi)
ALTER TABLE "kontrak_manajemen" ADD COLUMN "steps" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "kontrak_manajemen" ADD COLUMN "currentStepIndex" INTEGER NOT NULL DEFAULT 0;

-- InputRealisasi: lampiran evidence
ALTER TABLE "input_realisasi" ADD COLUMN "attachments" JSONB NOT NULL DEFAULT '[]';

-- Konsolidasi KM tahunan (persetujuan GM sekali)
CREATE TABLE "km_bundles" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reviewer" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "km_bundles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "km_bundles_year_key" ON "km_bundles"("year");
