import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FolderPlus,
  Calendar,
  Wallet,
  Users,
  ArrowRight,
  TrendingUp,
  Send,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const admin = createAdminClient();

  // Ambil profil pengguna
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Ambil data keanggotaan proyek user
  const { data: memberships } = await admin
    .from('project_members')
    .select('project_id, role')
    .eq('user_id', user.id);

  const memberProjectIds = memberships?.map((m) => m.project_id) || [];
  const isAuditor = memberships?.some((m) => m.role === 'auditor') || user.email?.includes('auditor');

  let query = admin
    .from('projects')
    .select('*, project_members(*, profile:user_id(*))');

  // Jika bukan auditor, batasi proyek milik sendiri atau di mana user menjadi anggota
  if (!isAuditor) {
    if (memberProjectIds.length > 0) {
      query = query.or(`created_by.eq.${user.id},id.in.(${memberProjectIds.join(',')})`);
    } else {
      query = query.eq('created_by', user.id);
    }
  }

  const { data: projects } = await query.order('created_at', { ascending: false });

  // Ambil statistik
  const totalProjects = projects?.length || 0;
  const totalBudget = projects?.reduce((acc, p) => acc + (Number(p.total_budget) || 0), 0) || 0;

  const schemeLabels: Record<string, { label: string }> = {
    kemdikbud_bima: { label: 'Kemdikbud BIMA' },
    brin: { label: 'Hibah BRIN' },
    internal_kampus: { label: 'Hibah Internal PT' },
    matching_fund: { label: 'Kedaireka' },
    industri: { label: 'Kemitraan Industri' },
    mandiri: { label: 'Penelitian Mandiri' },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
              Portofolio Penelitian & Hibah Riset
            </h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-bold">
              {totalProjects} Riset
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Kelola proposal hibah, koordinasi mahasiswa (MBKM), SPJ berbasis SBM, dan publikasi bereputasi.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Inisiasi Riset Baru</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Total Portofolio Riset
            </span>
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-950 tracking-tight">
              {totalProjects}
            </span>
            <span className="text-[11px] font-medium text-zinc-500">Judul Aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Alokasi Pagu Anggaran
            </span>
            <span className="w-2 h-2 rounded-full bg-zinc-950"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-950 tracking-tight font-mono">
              Rp {totalBudget.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Bot Notifikasi Telegram
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                profile?.telegram_chat_id ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'
              }`}
            ></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-bold text-zinc-950 font-mono">
              {profile?.telegram_chat_id ? 'TERKONEKSI' : 'BELUM AKTIF'}
            </span>
            <span className="text-[11px] text-zinc-500">
              {profile?.telegram_chat_id ? 'H-14, H-7, H-1 Aktif' : 'Atur di menu Pengaturan'}
            </span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {totalProjects === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 mb-3 border border-zinc-200">
            <FolderPlus className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">Belum Ada Proyek Riset Terdaftar</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
            Mulai kelola riset Anda sekarang. Daftarkan proposal hibah BIMA/BRIN atau penelitian mandiri untuk memantau WBS dan SPJ keuangan secara otomatis.
          </p>
          <div className="mt-5">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Inisiasi Riset Pertama</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects?.map((proj) => {
            const schemeInfo = schemeLabels[proj.scheme] || {
              label: proj.scheme,
            };

            return (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-900 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {schemeInfo.label}
                    </span>
                    <span className="font-mono text-xs font-semibold text-zinc-500">
                      TA {proj.fiscal_year}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                    <span className="font-bold text-zinc-700">Fokus:</span>
                    <span className="truncate">{proj.focus_area}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{proj.start_date} s/d {proj.end_date}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 font-mono text-xs font-bold text-zinc-900">
                      <Wallet className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>Rp {Number(proj.total_budget).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        proj.status === 'selesai'
                          ? 'bg-emerald-500'
                          : proj.status === 'aktif'
                          ? 'bg-orange-500'
                          : 'bg-zinc-400'
                      }`}
                    ></span>
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-600">
                      {proj.status}
                    </span>
                  </div>
                  <Link
                    href={`/projects/${proj.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 group-hover:text-orange-600 transition-colors"
                  >
                    <span>Masuk Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
