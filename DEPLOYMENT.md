# Panduan Deployment & Konfigurasi Produksi
## Sistem Informasi Manajemen Riset (SIM-Riset)

Platform ini dirancang **100% Zero Operational Cost** menggunakan batas gratis (*Free Tier*) dari Vercel, Supabase, Cloudinary, dan Telegram Bot API.

---

## 1. Langkah 1: Deploy ke Vercel (Hobby Tier)

1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New...** $\rightarrow$ **Project**.
3. Import repositori Anda: `gustyk/manajemen-riset`.
4. Pada bagian **Environment Variables**, masukkan seluruh variabel berikut (salin nilai dari file `.env.local` lokal Anda):

| Nama Variabel | Keterangan / Sumber |
| :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Domain Vercel Anda (contoh: `https://manajemen-riset.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Dari Supabase: Project Settings $\rightarrow$ API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dari Supabase: Project Settings $\rightarrow$ API |
| `SUPABASE_SERVICE_ROLE_KEY` | Dari Supabase: Project Settings $\rightarrow$ API (Secret) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`| Dari Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Dari Cloudinary Dashboard $\rightarrow$ API Keys |
| `CLOUDINARY_API_SECRET` | Dari Cloudinary Dashboard $\rightarrow$ API Keys |
| `TELEGRAM_BOT_TOKEN` | Token bot dari `@BotFather` |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`| Username bot (contoh: `SimRisetReminderBot`) |
| `TELEGRAM_WEBHOOK_SECRET` | String acak pengaman webhook |
| `CRON_SECRET` | String acak pengaman pemicu cron (min. 32 karakter) |

5. Klik **Deploy**. Tunggu hingga proses build selesai.

---

## 2. Langkah 2: Daftarkan Webhook Telegram

Setelah aplikasi terbit di Vercel (memiliki URL HTTPS publik), daftarkan endpoint webhook ke server Telegram agar bot dapat menerima perintah interaktif (`/status`, `/mytasks`, `/pending_logbook`, `/start`):

Jalankan perintah ini di terminal Anda (ganti `<TOKEN>`, `<DOMAIN_VERCEL>`, dan `<WEBHOOK_SECRET>`):

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<DOMAIN_VERCEL>/api/telegram/webhook&secret_token=<WEBHOOK_SECRET>"
```

Jika berhasil, Telegram akan merespon:
```json
{"ok": true, "result": true, "description": "Webhook was set"}
```

---

## 3. Langkah 3: Aktifkan Penjadwal Cron Harian di Supabase (pg_cron)

Untuk memicu evaluasi pengingat deadline otomatis setiap hari pukul 08:00 WIB tanpa bergantung pada batasan Vercel Hobby, aktifkan `pg_cron` bawaan PostgreSQL di Supabase:

1. Buka Dashboard Supabase Anda $\rightarrow$ Pilih project Anda.
2. Masuk ke menu **Database** $\rightarrow$ **Extensions**.
3. Pastikan ekstensi **`pg_cron`** dan **`pg_net`** telah aktif (*enabled*).
4. Masuk ke menu **SQL Editor**, buka tab baru dan jalankan query berikut:

```sql
SELECT cron.schedule(
  'daily-research-reminder-job',
  '0 1 * * *', -- Jam 01:00 UTC = Jam 08:00 WIB setiap hari
  $$
  SELECT net.http_post(
    url:='https://<DOMAIN_VERCEL_ANDA>/api/cron/reminder-dispatch',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer <CRON_SECRET_ANDA>"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
```

> **Verifikasi Penjadwal:**
> Anda dapat melihat daftar cron yang aktif di Supabase dengan perintah:
> ```sql
> SELECT * FROM cron.job;
> ```

---

## 4. Langkah 4: Kebijakan Row Level Security (RLS) di Supabase

### Apakah Perlu Dijalankan Secara Manual?
- **Untuk Berjalannya Aplikasi Web:** **TIDAK WAJIB**. Server Next.js SIM-Riset telah dilengkapi lapisan otentikasi ketat di sisi server (*Server-Side Authorization*) menggunakan `createAdminClient()` yang memvalidasi sesi login user sebelum mengembalikan data sesuai hak akses masing-masing role.
- **Untuk Perlindungan Berlapis (*Defense-in-Depth*):** **SANGAT DIANJURKAN**. Menjalankan skrip ini memastikan bahwa jika ada pihak yang mencoba mengakses tabel langsung melalui REST API client publik Supabase (*anon key*), PostgreSQL akan menolak akses yang tidak sah.

### Cara Menjalankan:
1. Buka Supabase Dashboard $\rightarrow$ **SQL Editor**.
2. Buka file [`supabase/migrations/20260913_complete_rls_policies.sql`](file:///mnt/d/Apps/roadmap-riset/supabase/migrations/20260913_complete_rls_policies.sql).
3. Salin seluruh kodenya dan klik **Run**.

---

## 5. Akun Dummy untuk Pengujian Demo & Pemulihan Data (*Seed*)

Platform telah menyediakan 5 akun dummy yang mencakup seluruh role di sistem:

> **Password Bersama untuk Semua Akun Dummy:** `DemoPassword2026!`

| Peran (Role) | Email Login | Password | Nama Lengkap & NIDN/NIM | Deskripsi Hak Akses |
| :--- | :--- | :--- | :--- | :--- |
| **Principal Investigator (PI)** | `pi.demo@simriset.ac.id` | `DemoPassword2026!` | **Prof. Dr. Ir. Wahyu Hidayat, M.Kom.**<br>NIDN: `0015087501` | Kendali penuh riset, RAB, validasi logbook, undang tim |
| **Co-PI (Dosen Anggota)** | `copi.demo@simriset.ac.id` | `DemoPassword2026!` | **Dr. Rina Anggraini, S.Kom., M.T.**<br>NIDN: `0712058801` | Kelola WBS tugas, pantau pengeluaran, reviu logbook |
| **Student RA (Mahasiswa)** | `student.demo@simriset.ac.id` | `DemoPassword2026!` | **Bagas Pratama Putra**<br>NIM: `202102001` | Kerjakan tugas Kanban, catat logbook, cetak portofolio MBKM |
| **Mitra Industri (Partner)** | `partner.demo@simriset.ac.id` | `DemoPassword2026!` | **Ir. Hendra Wijaya**<br>ID: `MITRA-IND-01` | Pantau prototipe, HKI, kontribusi pendanaan/in-kind |
| **Auditor LPPM (Reviewer)** | `auditor.demo@simriset.ac.id` | `DemoPassword2026!` | **Dra. Sri Wahyuni, M.Ak., Ak., CA**<br>NIP: `197508142000032001` | Audit SPJ, cek bukti nota Cloudinary, verifikasi pajak |

### Perintah Restore / Reset Database:
Jika sewaktu-waktu database di-reset, Anda dapat memulihkan seluruh akun dummy dan data proyek contoh secara otomatis dengan menjalankan:

```bash
npm run db:seed
```

---

## 6. Struktur Fitur Lengkap yang Telah Siap Digunakan

- [x] **Autentikasi & RBAC:** Login / Registrasi 5 role (PI, Co-PI, Student RA, Partner, Auditor).
- [x] **Manajemen Proyek:** Pemetaan proposal, skema (BIMA, BRIN, Kedaireka, Mandiri), dan anggota tim.
- [x] **Undang & Kelola Tim:** Modal interaktif untuk menambah/menghapus anggota tim per role.
- [x] **Task & WBS:** Kanban board dan pembagian tugas per anggota dengan level prioritas.
- [x] **Logbook Mahasiswa:** Pencatatan durasi jam, link commit git, dan persetujuan dosen pembimbing.
- [x] **Keuangan & SPJ:** Rencana Anggaran (RAB), pencatatan nota riil, upload Cloudinary, dan cetak SPJ format audit.
- [x] **Konversi MBKM/Skripsi:** Cetak lembar portofolio dan rekam jejak kontribusi mahasiswa untuk rekognisi nilai.
- [x] **Mesin Notifikasi Telegram:**
  - Pengingat otomatis H-30, H-14, H-7, H-3, H-1 untuk laporan kemajuan, laporan akhir, deadline tugas, dan revisi naskah publikasi.
  - Perintah bot: `/status`, `/mytasks`, `/pending_logbook`, `/help`.
  - Uji coba instan via tombol *"Kirim Test Ping"* di workspace proyek.
- [x] **Pelacakan Luaran Riset:** Pipeline publikasi Scopus/Sinta dan pendaftaran sertifikat HKI.
- [x] **Seeding Terotomasi:** Perintah `npm run db:seed` untuk pemulihan instan setelah reset database.
