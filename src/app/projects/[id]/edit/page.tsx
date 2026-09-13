import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import EditProjectForm from './EditProjectForm';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-orange-600 selection:text-white">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-950 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Workspace Proyek</span>
        </Link>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 sm:p-10">
          <div className="border-b border-zinc-200 pb-5 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Pengaturan Informasi Proyek
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-zinc-950 tracking-tight">
              Edit Metadata & Konfigurasi Riset
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Perbarui judul riset, skema pendanaan, alokasi pagu, atau sesuaikan ID Grup Telegram.
            </p>
          </div>

          <EditProjectForm project={project} />
        </div>
      </div>
    </div>
  );
}
