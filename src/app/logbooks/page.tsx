import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { BookOpen, Calendar, Clock, ExternalLink } from 'lucide-react';

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
      <div className="border-b border-zinc-200 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-600"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Aktivitas Mahasiswa & Asisten Riset
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
            Rekapitulasi Logbook Harian Riset
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Pantau jam kerja, deskripsi teknis, dan verifikasi konversi SKS MBKM / Skripsi mahasiswa.
          </p>
        </div>
      </div>

      {!logbooks || logbooks.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">Belum Ada Catatan Logbook</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Catatan logbook yang diisi mahasiswa pada workspace masing-masing riset akan terangkum otomatis di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logbooks.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs hover:border-zinc-900 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div>
                  <Link
                    href={`/projects/${log.project_id}?tab=logbooks`}
                    className="text-xs font-bold text-zinc-950 hover:text-orange-600 transition-colors block"
                  >
                    {log.projects?.title}
                  </Link>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Oleh: <strong className="text-zinc-800 font-semibold">{log.student_profile?.full_name}</strong>{' '}
                    <span className="font-mono text-zinc-400">({log.student_profile?.nidn_nim || '-'})</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {log.activity_date}
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-xs font-mono text-zinc-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {log.hours_spent} Jam
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      log.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : log.status === 'rejected'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-orange-50 text-orange-800 border-orange-200'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                {log.activity_description}
              </p>

              {log.evidence_url && (
                <div className="pt-1">
                  <a
                    href={log.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-semibold text-orange-600 hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Tautan Bukti Pengerjaan / Commit Git</span>
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
