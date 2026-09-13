# SIM-Riset: Sistem Informasi Manajemen Portofolio Riset Kolaboratif & Otomasi Pengingat

> **Platform Web Kolaboratif Pengelolaan Riset Akademik, WBS/Kanban, Logbook Harian Mahasiswa (MBKM), SPJ Keuangan Berbasis Standar Biaya Masukan (SBM), dan Mesin Notifikasi Telegram Terjadwal.**  
> Dirancang **100% Zero Operational Cost** menggunakan paket gratis (*Free Tier*) dari Next.js, Supabase, Cloudinary, Telegram Bot API, dan Vercel.

---

## 🌟 Fitur Utama

1. **Multi-Role Collaborative Workspace (RBAC):**
   - **Ketua Peneliti (PI):** Kendali penuh proyek, RAB, validasi logbook, penugasan tugas, manajemen tim, dan cetak SPJ / portofolio.
   - **Dosen Anggota (Co-PI):** Kolaborator penelitian, pengawasan milestone WBS, telaah logbook, dan monitoring luaran ilmiah.
   - **Mahasiswa Asisten Riset (Student RA):** Pelaksana teknis, pencatat logbook harian (durasi jam + commit Git), dan penerima transkrip ekuivalensi SKS MBKM.
   - **Mitra Industri (Partner):** PIC industri/pemerintah, monitoring capaian prototipe/HKI, dan rekap kontribusi kemitraan.
   - **Auditor Internal LPPM:** Pemeriksa kepatuhan belanja terhadap SBM, keabsahan kuitansi Cloudinary, dan pemotongan pajak (PPh 21/23/PPN).

2. **WBS & Kanban Board:**
   - Pembagian tugas terstruktur (*Todo*, *In Progress*, *Review*, *Done*) dengan level prioritas (Low s.d. Critical) dan tenggat waktu.

3. **Logbook Digital & Ekuivalensi MBKM/Skripsi:**
   - Pengisian kemajuan harian dengan bukti tautan commit GitHub.
   - Fitur reviu langsung dosen pembimbing (*Approved* / *Revision Requested*).
   - Lembar cetak resmi Transkrip Aktivitas Riset & Sertifikat Konversi SKS MBKM di `/projects/[id]/student/[userId]`.

4. **Keuangan SBM, Pajak Otomatis & SPJ Siap Audit:**
   - Pos anggaran RAB sesuai Standar Biaya Masukan (SBM).
   - Realisasi belanja dengan kalkulator pajak instan (PPh 21 5%, PPh 23 2%, PPN 11%).
   - Unggah kuitansi digital aman langsung ke Cloudinary (*Signed Upload*).
   - Cetak format Buku Kas Pembantu (SPJ) berstandar audit keuangan di `/projects/[id]/spj/print`.

5. **Mesin Notifikasi Telegram & Supabase `pg_cron`:**
   - Bot interaktif `@SimRisetReminderBot` (`/start <token>`, `/status`, `/mytasks`, `/pending_logbook`, `/help`).
   - Penjadwal pengingat otomatis (H-30, H-14, H-7, H-3, H-1, H-0) untuk laporan kemajuan, laporan akhir, batas tugas, dan revisi naskah.
   - Eksekusi harian jam 08:00 WIB ditenagai `pg_cron` dan `pg_net` berproteksi `CRON_SECRET`.

---

## 👥 Akun Dummy untuk Pengujian & Demo

Sistem telah dilengkapi dengan akun dummy untuk setiap peran agar Anda dapat langsung menguji alur kerja kolaboratif tanpa perlu registrasi manual:

> **Password Bersama untuk Semua Akun Dummy:** `DemoPassword2026!`

| Peran (Role) | Email Login | Password | Nama Lengkap & NIDN/NIM | Fokus Pengujian |
| :--- | :--- | :--- | :--- | :--- |
| **Principal Investigator (PI)** | `pi.demo@simriset.ac.id` | `DemoPassword2026!` | **Prof. Dr. Ir. Wahyu Hidayat, M.Kom.**<br>NIDN: `0015087501` | Kelola proyek, RAB, approve logbook, undang tim |
| **Co-PI (Dosen Anggota)** | `copi.demo@simriset.ac.id` | `DemoPassword2026!` | **Dr. Rina Anggraini, S.Kom., M.T.**<br>NIDN: `0712058801` | Pantau tugas, reviu logbook, draft jurnal |
| **Student RA (Mahasiswa)** | `student.demo@simriset.ac.id` | `DemoPassword2026!` | **Bagas Pratama Putra**<br>NIM: `202102001` | Kerjakan WBS, isi logbook, cetak portofolio MBKM |
| **Mitra Industri (Partner)** | `partner.demo@simriset.ac.id` | `DemoPassword2026!` | **Ir. Hendra Wijaya**<br>ID: `MITRA-IND-01` | Pantau prototipe, HKI, kontribusi in-kind |
| **Auditor LPPM (Reviewer)** | `auditor.demo@simriset.ac.id` | `DemoPassword2026!` | **Dra. Sri Wahyuni, M.Ak., Ak., CA**<br>NIP: `197508142000032001` | Audit SPJ, cek bukti nota Cloudinary, verifikasi pajak |

---

## ⚡ Perintah Seeding Database (Reset & Restore)

Jika sewaktu-waktu database di-reset atau Anda ingin mengembalikan data demo ke kondisi awal, cukup jalankan perintah:

```bash
npm run db:seed
```

Perintah ini secara otomatis akan:
1. Mendaftarkan seluruh 5 akun dummy di Supabase Auth (terverifikasi otomatis tanpa konfirmasi email).
2. Mengisi profil lengkap di tabel `profiles`.
3. Memulihkan proyek demo (*uji manual riset satu*) beserta anggota timnya.
4. Menanamkan 4 contoh tugas WBS, 3 catatan logbook mahasiswa, 3 pos RAB, 2 belanja kuitansi Cloudinary berpajak, 3 capaian luaran riset, dan 6 aturan pengingat Telegram.

---

## 🚀 Panduan Menjalankan Aplikasi Secara Lokal

1. **Clone repositori:**
   ```bash
   git clone https://github.com/gustyk/manajemen-riset.git
   cd manajemen-riset
   ```

2. **Pasang dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Lingkungan (`.env.local`):**
   Salin `.env.example` ke `.env.local` dan lengkapi kredensial Supabase, Cloudinary, dan Telegram Anda:
   ```bash
   cp .env.example .env.local
   ```

4. **Jalankan Seeding Awal:**
   ```bash
   npm run db:seed
   ```

5. **Mulai Server Pengembangan:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) (atau [http://localhost:3001](http://localhost:3001)) di peramban Anda.

---

## 📖 Dokumentasi Terkait

- [DEPLOYMENT.md](file:///mnt/d/Apps/roadmap-riset/DEPLOYMENT.md) — Panduan lengkap publikasi ke Vercel, pendaftaran webhook Telegram, dan aktivasi `pg_cron`.
- [01-srs-research-management-system.md](file:///home/caktyk/.gemini/antigravity-cli/brain/2a5b5205-82c7-452f-85d4-dc0ef3f2ebe1/01-srs-research-management-system.md) — Software Requirements Specification (SRS).
- [02-technical-architecture-and-database-schema.md](file:///home/caktyk/.gemini/antigravity-cli/brain/2a5b5205-82c7-452f-85d4-dc0ef3f2ebe1/02-technical-architecture-and-database-schema.md) — Arsitektur Teknis & Skema Database PostgreSQL.
- [03-implementation-roadmap.md](file:///home/caktyk/.gemini/antigravity-cli/brain/2a5b5205-82c7-452f-85d4-dc0ef3f2ebe1/03-implementation-roadmap.md) — Rencana Sprint & Verifikasi Deliverable.
