'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createProject } from '@/app/projects/actions';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Wallet,
  Send,
  HelpCircle,
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Proyek</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10">
          <div className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Inisiasi Proyek Riset Baru
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Daftarkan judul penelitian, skema pendanaan, dan hubungkan dengan grup Telegram tim.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <span className="font-semibold">Kesalahan:</span> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Judul Riset */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Judul Penelitian / Judul Hibah <span className="text-red-500">*</span>
              </label>
              <textarea
                name="title"
                rows={3}
                required
                placeholder="Contoh: Pengembangan Arsitektur Microservices untuk Tata Kelola Logistik Maritim Berbasis Smart Contract"
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Fokus Bidang SI */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Klaster / Bidang Fokus SI
                </label>
                <input
                  name="focusArea"
                  type="text"
                  defaultValue="Rekayasa Sistem Informasi & Enterprise"
                  placeholder="Contoh: AI & Data Science, Tata Kelola IT"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Skema Pendanaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Skema Pendanaan <span className="text-red-500">*</span>
                </label>
                <select
                  name="scheme"
                  required
                  defaultValue="kemdikbud_bima"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Tahun Anggaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tahun Anggaran
                </label>
                <input
                  name="fiscalYear"
                  type="number"
                  defaultValue={currentYear}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Tanggal Mulai */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  name="startDate"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Tanggal Selesai */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Selesai / Deadline <span className="text-red-500">*</span>
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
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Total Anggaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Total Anggaran (Rp)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    name="totalBudget"
                    type="number"
                    defaultValue={50000000}
                    step={1000000}
                    className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Telegram Group ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>Chat ID Grup Telegram</span>
                  <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  name="telegramGroupId"
                  type="text"
                  placeholder="Contoh: -1001234567890"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Kotak Informasi Telegram Bot */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
              <Send className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Pengaturan Notifikasi Otomatis:</p>
                <p className="text-indigo-800 leading-relaxed">
                  Setelah proyek dibuat, sistem akan otomatis mendaftarkan aturan pengingat (H-14, H-7, H-1) menuju deadline laporan kemajuan dan laporan akhir. Jika Anda memasukkan Chat ID grup Telegram, bot <span className="font-semibold text-indigo-900">@SimRisetReminderBot</span> dapat mengirimkan peringatan langsung ke grup tim riset Anda.
                </p>
              </div>
            </div>

            {/* Tombol Submit */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link
                href="/projects"
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Proyek...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Inisiasi Riset Sekarang</span>
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
