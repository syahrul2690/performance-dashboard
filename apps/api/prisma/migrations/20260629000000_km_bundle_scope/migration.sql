-- Pisah KM Bundle menjadi dua scope: KP (Kantor Induk) dan UPMK (gabungan UPMK1-5).
-- Data lama (sebelumnya satu bundle per tahun) dimigrasikan ke scope='KP'.

-- 1. Tambah kolom scope dengan default 'KP' (otomatis migrasi data lama)
ALTER TABLE "km_bundles" ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'KP';

-- 2. Hapus unique constraint lama pada year saja
ALTER TABLE "km_bundles" DROP CONSTRAINT "km_bundles_year_key";

-- 3. Tambah composite unique constraint (year, scope)
ALTER TABLE "km_bundles" ADD CONSTRAINT "km_bundles_year_scope_key" UNIQUE ("year", "scope");
