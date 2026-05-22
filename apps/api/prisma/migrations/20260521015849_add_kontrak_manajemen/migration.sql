-- CreateTable
CREATE TABLE "kontrak_manajemen" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "unitCode" TEXT NOT NULL,
    "bidang" TEXT NOT NULL,
    "holder" TEXT NOT NULL,
    "kpiItems" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submitter" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kontrak_manajemen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kontrak_manajemen_periodId_unitCode_key" ON "kontrak_manajemen"("periodId", "unitCode");
