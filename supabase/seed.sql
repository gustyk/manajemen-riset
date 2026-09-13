-- ==============================================================================
-- SISTEM INFORMASI MANAJEMEN RISET (SIM-RISET)
-- Database Seed File (Data Referensi / Proyek Demo)
-- Gunakan skrip ini atau jalankan `npm run db:seed` melalui Node.js CLI.
-- ==============================================================================

-- 1. Pastikan Ekstensi Aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Catatan: Untuk mendaftarkan akun Auth Supabase beserta enkripsi password bcrypt,
-- gunakan perintah CLI: `npm run db:seed`.
-- Skrip SQL di bawah ini mengisi data master proyek, tugas, logbook, RAB, dan luaran.
