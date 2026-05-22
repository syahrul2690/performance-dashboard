-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roleVariantId" TEXT;

-- CreateTable
CREATE TABLE "role_variants" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tier" "Role" NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proses_bisnis_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proses_bisnis_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisasi_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisasi_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gcg_esg_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gcg_esg_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peta_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peta_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_variants_code_key" ON "role_variants"("code");

-- CreateIndex
CREATE UNIQUE INDEX "proses_bisnis_snapshots_periodId_key" ON "proses_bisnis_snapshots"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "organisasi_snapshots_periodId_key" ON "organisasi_snapshots"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "gcg_esg_snapshots_periodId_key" ON "gcg_esg_snapshots"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "peta_snapshots_periodId_key" ON "peta_snapshots"("periodId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleVariantId_fkey" FOREIGN KEY ("roleVariantId") REFERENCES "role_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
