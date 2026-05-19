-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STAFF', 'ASMAN', 'MANAJER', 'SRMANAJER', 'GM');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'NEEDS_REVISION', 'APPROVED');

-- CreateEnum
CREATE TYPE "KMDocStatus" AS ENUM ('IN_REVIEW_C1', 'IN_REVIEW_C2', 'IN_REVIEW_SM', 'APPROVED', 'RETURNED');

-- CreateEnum
CREATE TYPE "KMDocType" AS ENUM ('WF1', 'WF1B', 'WF2', 'WF3');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "unit" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_prefs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyInApp" BOOLEAN NOT NULL DEFAULT true,
    "notifyWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "digestFrequency" TEXT NOT NULL DEFAULT 'daily',

    CONSTRAINT "user_prefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periods" (
    "id" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategic_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "human_capital_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "human_capital_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_snapshots" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "currentStage" INTEGER NOT NULL DEFAULT 1,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "nextApprover" TEXT,
    "history" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "km_documents" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "tipe" "KMDocType" NOT NULL,
    "bidangUnit" TEXT NOT NULL,
    "holder" TEXT NOT NULL,
    "status" "KMDocStatus" NOT NULL,
    "deadline" TIMESTAMP(3),
    "slaRemain" INTEGER,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "km_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "km_reviews" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "km_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "input_realisasi" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "unitCode" TEXT NOT NULL,
    "submitter" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "input_realisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "msg" TEXT NOT NULL,
    "route" TEXT,
    "targetId" TEXT,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "targetId" TEXT,
    "note" TEXT,
    "diff" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_prefs_userId_key" ON "user_prefs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "periods_yearMonth_key" ON "periods"("yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "executive_snapshots_periodId_key" ON "executive_snapshots"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_snapshots_periodId_key" ON "financial_snapshots"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "operational_snapshots_periodId_key" ON "operational_snapshots"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "strategic_snapshots_periodId_key" ON "strategic_snapshots"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "human_capital_snapshots_periodId_key" ON "human_capital_snapshots"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "risk_snapshots_periodId_key" ON "risk_snapshots"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_unit_periodId_key" ON "reports"("unit", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "km_documents_docId_key" ON "km_documents"("docId");

-- CreateIndex
CREATE UNIQUE INDEX "input_realisasi_periodId_unitCode_key" ON "input_realisasi"("periodId", "unitCode");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prefs" ADD CONSTRAINT "user_prefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "km_reviews" ADD CONSTRAINT "km_reviews_docId_fkey" FOREIGN KEY ("docId") REFERENCES "km_documents"("docId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
