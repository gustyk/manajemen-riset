'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateProject } from '@/app/projects/actions';
import {
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <span className="font-semibold">Kesalahan:</span> {errorMessage}
        </div>
      )}

      {/* Judul Riset */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Judul Penelitian / Judul Hibah <span className="text-red-500">*</span>
        </label>
        <textarea
          name="title"
          rows={3}
          required
          defaultValue={project.title}
          placeholder="Judul lengkap penelitian"
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
            defaultValue={project.focus_area}
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
            defaultValue={project.scheme}
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
            defaultValue={project.fiscal_year}
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
            defaultValue={project.start_date}
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
            defaultValue={project.end_date}
            className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Anggaran */}
        <div className="sm:col-span-1">
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
              defaultValue={project.total_budget}
              step={500000}
              className="w-full pl-11 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Status Proyek */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Status Pelaksanaan
          </label>
          <select
            name="status"
            defaultValue={project.status}
            className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white capitalize"
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="funded">Funded / Didanai</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Telegram Group ID */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Chat ID Grup Telegram</span>
          </label>
          <input
            name="telegramGroupId"
            type="text"
            defaultValue={project.telegram_group_id || ''}
            placeholder="Contoh: -1001234567890"
            className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Panduan Chat ID Grup Telegram */}
      <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-3 text-xs text-sky-950">
        <Send className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sky-900">Petunjuk Mengetahui Chat ID Grup Telegram:</p>
          <p className="text-sky-800 leading-relaxed">
            1. Tambahkan bot <span className="font-semibold text-indigo-700">@SimRisetReminderBot</span> ke grup riset Anda.<br />
            2. Jadikan bot sebagai Administrator (minimal hak kirim pesan).<br />
            3. Tambahkan bot pembantu seperti <code>@RawDataBot</code> atau <code>@userinfobot</code> ke grup tersebut untuk melihat ID grup (biasanya berupa angka minus panjang, contoh: <strong>-1002345678901</strong>).<br />
            4. Salin angka tersebut lengkap dengan tanda minus (-) ke kolom Chat ID di atas.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
        <Link
          href={`/projects/${project.id}`}
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
              <span>Menyimpan Perubahan...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
