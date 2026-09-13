import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import EditProjectForm from './EditProjectForm';
import { ArrowLeft, BookOpen, Send } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Workspace Proyek</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10">
          <div className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Edit Informasi Proyek Riset
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Perbarui judul, skema, alokasi anggaran, status, atau perbaiki Chat ID Grup Telegram.
            </p>
          </div>

          <EditProjectForm project={project} />
        </div>
      </div>
    </div>
  );
}
