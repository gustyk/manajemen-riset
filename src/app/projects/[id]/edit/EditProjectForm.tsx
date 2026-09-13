'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateProject } from '@/app/projects/actions';
import {
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface EditProjectFormProps {
  project: any;
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateProject(project.id, formData);
      if (res?.error) {
        setErrorMessage(res.error);
        setLoading(false);
      } else {
        router.push(`/projects/${project.id}`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui data proyek');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <span className="font-bold">Kesalahan:</span> {errorMessage}
        </div>
      )}

      {/* Judul Riset */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
          Judul Penelitian / Hibah <span className="text-orange-600">*</span>
        </label>
        <textarea
          name="title"
          rows={3}
          required
          defaultValue={project.title}
          placeholder="Judul lengkap penelitian"
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
            defaultValue={project.focus_area}
            className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
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
            defaultValue={project.scheme}
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
            defaultValue={project.fiscal_year}
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
            defaultValue={project.start_date}
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
            defaultValue={project.end_date}
            className="w-full px-3.5 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Anggaran */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
            Alokasi Pagu (Rp)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono font-bold text-zinc-500">
              Rp
            </span>
            <input
              name="totalBudget"
              type="number"
              defaultValue={project.total_budget}
              step={500000}
              className="w-full pl-10 pr-3.5 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
            />
          </div>
        </div>

        {/* Status Proyek */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
            Status Pelaksanaan
          </label>
          <select
            name="status"
            defaultValue={project.status}
            className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors bg-white capitalize font-mono"
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="funded">Funded / Didanai</option>
            <option value="completed">Completed / Selesai</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Telegram Group ID */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
            Chat ID Grup Telegram
          </label>
          <input
            name="telegramGroupId"
            type="text"
            defaultValue={project.telegram_group_id || ''}
            placeholder="-1001234567890"
            className="w-full px-3.5 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
          />
        </div>
      </div>

      {/* Panduan Chat ID Grup Telegram */}
      <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-300">
        <Send className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white text-[11px]">Petunjuk Sinkronisasi Grup Telegram:</p>
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            1. Tambahkan bot <span className="font-mono text-orange-400 font-semibold">@SimRisetReminderBot</span> ke grup riset Anda.<br />
            2. Berikan izin kirim pesan bagi bot.<br />
            3. Dapatkan chat ID grup (biasanya diawali tanda minus (-), contoh: <code>-1002345678901</code>) lalu masukkan di atas.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200">
        <Link
          href={`/projects/${project.id}`}
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
              <span>Menyimpan Perubahan...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
