import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProjectWorkspaceTabs from './ProjectWorkspaceTabs';
import {
  Calendar,
  Wallet,
  ArrowLeft,
  Users,
  Send,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = 'overview' } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const admin = createAdminClient();

  // 1. Ambil data proyek
  const { data: project, error: projectError } = await admin
    .from('projects')
    .select('*, created_by_profile:created_by(*)')
    .eq('id', id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // 2. Ambil profil user saat ini
  const { data: currentProfile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // 3. Ambil anggota tim
  const { data: members } = await admin
    .from('project_members')
    .select('*, profile:user_id(*)')
    .eq('project_id', id);

  // Periksa hak akses dan peran pengguna
  const currentMember = members?.find((m) => m.user_id === user.id);
  const isCreator = project.created_by === user.id;
  const isAuditor = currentMember?.role === 'auditor' || user.email?.includes('auditor');

  if (!isCreator && !currentMember && !isAuditor) {
    notFound();
  }

  const userRole = currentMember?.role || (isCreator ? 'pi' : isAuditor ? 'auditor' : 'student_ra');
  const isPI = userRole === 'pi' || isCreator;

  // 4. Ambil tugas / tasks
  const { data: tasks } = await admin
    .from('tasks')
    .select('*, assigned_profile:assigned_to(*)')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  // 5. Ambil logbooks
  const { data: logbooks } = await admin
    .from('logbooks')
    .select('*, student_profile:user_id(*)')
    .eq('project_id', id)
    .order('activity_date', { ascending: false });

  // 6. Ambil anggaran & expenses
  const { data: budgetItems } = await admin
    .from('budget_items')
    .select('*')
    .eq('project_id', id);

  const { data: expenses } = await admin
    .from('expenses')
    .select('*')
    .eq('project_id', id)
    .order('expense_date', { ascending: false });

  // 7. Ambil aturan notifikasi
  const { data: notificationRules } = await admin
    .from('notification_rules')
    .select('*')
    .eq('project_id', id)
    .order('trigger_offset_days', { ascending: true });

  // 8. Ambil luaran riset & publikasi
  const { data: outputs } = await admin
    .from('research_outputs')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  const schemeLabels: Record<string, string> = {
    kemdikbud_bima: 'Hibah Kemdikbudristek (BIMA)',
    brin: 'Hibah Riset BRIN',
    internal_kampus: 'Hibah Internal Kampus',
    matching_fund: 'Matching Fund Kedaireka',
    industri: 'Kerja Sama Industri',
    mandiri: 'Penelitian Mandiri',
  };

  return (
    <DashboardLayout
      user={{
        id: user?.id || '',
        email: user?.email,
        fullName: currentProfile?.full_name,
        telegramChatId: currentProfile?.telegram_chat_id,
      }}
    >
      {/* Back button */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Proyek</span>
      </Link>

      {/* Project Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {schemeLabels[project.scheme] || project.scheme}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                TA {project.fiscal_year}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Status: {project.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Fokus: <span className="font-semibold text-slate-700">{project.focus_area}</span> • Ketua Peneliti:{' '}
              <span className="font-semibold text-slate-700">
                {project.created_by_profile?.full_name || 'Dosen Sistem Informasi'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Alokasi Pagu
              </span>
              <span className="text-base font-black text-slate-900">
                Rp {Number(project.total_budget).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Periode Riset
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {project.start_date} s/d {project.end_date}
              </span>
            </div>
            {isPI && (
              <>
                <div className="h-8 w-px bg-slate-200" />
                <Link
                  href={`/projects/${id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Edit Proyek</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Tabs Workspace */}
      <ProjectWorkspaceTabs
        projectId={id}
        currentTab={tab}
        isPI={isPI}
        userRole={userRole}
        currentUserId={user.id}
        project={project}
        members={members || []}
        tasks={tasks || []}
        logbooks={logbooks || []}
        budgetItems={budgetItems || []}
        expenses={expenses || []}
        notificationRules={notificationRules || []}
        outputs={outputs || []}
      />
    </DashboardLayout>
  );
}
