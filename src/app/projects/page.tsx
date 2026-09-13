import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FolderPlus,
  Calendar,
  Wallet,
  Users,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ambil profil pengguna
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .maybeSingle();

  // Ambil daftar proyek
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, project_members(*)')
    .order('created_at', { ascending: false });

  // Ambil statistik sederhana
  const totalProjects = projects?.length || 0;
  const totalBudget = projects?.reduce((acc, p) => acc + (Number(p.total_budget) || 0), 0) || 0;

  const schemeLabels: Record<string, { label: string; color: string }> = {
    kemdikbud_bima: { label: 'Hibah Kemdikbud BIMA', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    brin: { label: 'Hibah BRIN', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    internal_kampus: { label: 'Hibah Internal Perguruan Tinggi', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    matching_fund: { label: 'Matching Fund Kedaireka', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    industri: { label: 'Kerja Sama Industri', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    mandiri: { label: 'Penelitian Mandiri', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  return (
    <DashboardLayout
      user={{
        id: user?.id || '',
        email: user?.email,
        fullName: profile?.full_name,
        telegramChatId: profile?.telegram_chat_id,
      }}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Daftar Penelitian & Hibah Riset
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola proposal, tim peneliti mahasiswa, anggaran SPJ, dan luaran publikasi terindeks.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Inisiasi Riset Baru</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 my-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Total Proyek Riset
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {totalProjects}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Total Alokasi Anggaran
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              Rp {totalBudget.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Status Bot Telegram
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              {profile?.telegram_chat_id ? 'Tersambung (Aktif)' : 'Belum Terhubung'}
            </span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {totalProjects === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Belum Ada Proyek Riset</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Mulai kelola riset Anda sekarang. Tambahkan proposal hibah atau riset mandiri pertama Anda untuk memonitor tahapan hulu ke hilir.
          </p>
          <div className="mt-6">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Inisiasi Riset Pertama</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects?.map((proj) => {
            const schemeInfo = schemeLabels[proj.scheme] || {
              label: proj.scheme,
              color: 'bg-slate-100 text-slate-700 border-slate-200',
            };

            return (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${schemeInfo.color}`}
                    >
                      {schemeInfo.label}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      TA {proj.fiscal_year}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Fokus:</span>
                    <span>{proj.focus_area}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {proj.start_date} s/d {proj.end_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Rp {Number(proj.total_budget).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {proj.status}
                    </span>
                  </div>
                  <Link
                    href={`/projects/${proj.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Masuk Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
