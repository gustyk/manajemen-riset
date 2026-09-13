import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { BookOpen, Calendar, Clock, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { verifyLogbook } from '@/app/projects/[id]/actions';

export const dynamic = 'force-dynamic';

export default async function LogbooksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .maybeSingle();

  // Ambil seluruh logbook di mana pengguna adalah PI atau pemilik
  const { data: logbooks } = await supabase
    .from('logbooks')
    .select('*, projects(*), student_profile:user_id(*)')
    .order('activity_date', { ascending: false });

  return (
    <DashboardLayout
      user={{
        id: user?.id || '',
        email: user?.email,
        fullName: profile?.full_name,
        telegramChatId: profile?.telegram_chat_id,
      }}
    >
      <div className="border-b border-slate-200 pb-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Rekapitulasi Logbook Aktivitas Riset
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Pantau seluruh aktivitas harian mahasiswa asisten peneliti dan beri verifikasi langsung.
        </p>
      </div>

      {!logbooks || logbooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Catatan Logbook</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Logbook yang diinput mahasiswa pada masing-masing workspace proyek akan terkumpul otomatis di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logbooks.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <Link
                    href={`/projects/${log.project_id}?tab=logbooks`}
                    className="text-xs font-bold text-indigo-600 hover:underline block"
                  >
                    {log.projects?.title}
                  </Link>
                  <p className="text-[11px] text-slate-500">
                    Oleh: <span className="font-semibold text-slate-700">{log.student_profile?.full_name}</span> ({log.student_profile?.nidn_nim || '-'})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {log.activity_date}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {log.hours_spent} Jam
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      log.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {log.activity_description}
              </p>

              {log.evidence_url && (
                <div className="pt-1">
                  <a
                    href={log.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Tautan Bukti Pengerjaan / Commit</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
