'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createProject } from '@/app/projects/actions';
import {
  ArrowLeft,
  Calendar,
  Wallet,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await createProject(formData);
      if (res?.error) {
        setErrorMessage(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) return;
      setErrorMessage(err.message || 'Gagal membuat proyek riset');
      setLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-orange-600 selection:text-white">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-950 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Proyek</span>
        </Link>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 sm:p-10">
          <div className="border-b border-zinc-200 pb-5 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Inisiasi Hibah / Riset Mandiri
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-zinc-950 tracking-tight">
              Pendaftaran Portofolio Riset Baru
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Daftarkan judul penelitian, skema pendanaan, dan sinkronkan dengan grup Telegram tim.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <span className="font-bold">Kesalahan:</span> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Judul Riset */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Judul Penelitian / Hibah <span className="text-orange-600">*</span>
              </label>
              <textarea
                name="title"
                rows={3}
                required
                placeholder="Contoh: Pengembangan Sistem Pendukung Keputusan Berbasis Multi-Agent untuk Optimasi Logistik Maritim"
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fokus Bidang SI */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Bidang Fokus / Klaster Riset
                </label>
                <input
                  name="focusArea"
                  type="text"
                  defaultValue="Rekayasa Sistem Informasi & Enterprise"
                  placeholder="Contoh: AI & Data Science, Tata Kelola IT"
                  className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>

              {/* Skema Pendanaan */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Skema Pendanaan <span className="text-orange-600">*</span>
                </label>
                <select
                  name="scheme"
                  required
                  defaultValue="kemdikbud_bima"
                  className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors bg-white font-mono"
                >
                  <option value="kemdikbud_bima">Hibah Kemdikbudristek (BIMA)</option>
                  <option value="brin">Hibah Riset BRIN</option>
                  <option value="internal_kampus">Hibah Internal Perguruan Tinggi</option>
                  <option value="matching_fund">Matching Fund Kedaireka</option>
                  <option value="industri">Kerja Sama Industri</option>
                  <option value="mandiri">Riset Mandiri / Swadana</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Tahun Anggaran */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Tahun Anggaran
                </label>
                <input
                  name="fiscalYear"
                  type="number"
                  defaultValue={currentYear}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>

              {/* Tanggal Mulai */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Tanggal Mulai <span className="text-orange-600">*</span>
                </label>
                <input
                  name="startDate"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>

              {/* Tanggal Selesai */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Deadline Selesai <span className="text-orange-600">*</span>
                </label>
                <input
                  name="endDate"
                  type="date"
                  required
                  defaultValue={
                    new Date(new Date().setMonth(new Date().getMonth() + 8))
                      .toISOString()
                      .split('T')[0]
                  }
                  className="w-full px-3.5 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Total Anggaran */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Alokasi Anggaran Pagu (Rp)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono font-bold text-zinc-500">
                    Rp
                  </span>
                  <input
                    name="totalBudget"
                    type="number"
                    defaultValue={50000000}
                    step={1000000}
                    className="w-full pl-10 pr-3.5 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                  />
                </div>
              </div>

              {/* Telegram Group ID */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center justify-between">
                  <span>Chat ID Grup Telegram</span>
                  <span className="text-zinc-400 font-normal lowercase">(opsional)</span>
                </label>
                <input
                  name="telegramGroupId"
                  type="text"
                  placeholder="Contoh: -1001234567890"
                  className="w-full px-3.5 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>
            </div>

            {/* Kotak Informasi Otomasi Telegram */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-300">
              <Send className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white mb-1">Otomasi Notifikasi Jadwal & Batas Waktu:</p>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Sistem otomatis mengaktifkan aturan pengingat (H-14, H-7, H-1) menuju batas laporan kemajuan dan akhir riset. Notifikasi dikirimkan langsung oleh bot <span className="font-mono text-orange-400 font-semibold">@SimRisetReminderBot</span> ke grup riset Anda.
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200">
              <Link
                href="/projects"
                className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mendaftarkan Riset...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Daftarkan Proyek Riset</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
