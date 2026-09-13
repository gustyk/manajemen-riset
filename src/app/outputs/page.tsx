import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { Award, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OutputsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .maybeSingle();

  const { data: outputs } = await supabase
    .from('research_outputs')
    .select('*, projects(*)')
    .order('created_at', { ascending: false });

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
              Capaian Kinerja Riset
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
            Pelacakan Luaran Riset & Publikasi
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Monitoring naskah jurnal (Scopus/Sinta), sertifikat HKI hak cipta software, dan prototipe sistem.
          </p>
        </div>
      </div>

      {!outputs || outputs.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-200">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">Belum Ada Luaran Terdaftar</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Setiap target publikasi atau permohonan HKI dapat dipantau tahapan peer-review-nya secara berkala.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outputs.map((out) => (
            <div
              key={out.id}
              className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs hover:border-zinc-900 transition-colors space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                    {out.output_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                    {out.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-zinc-950 leading-snug">{out.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Target Outlet: <strong className="text-zinc-800 font-semibold">{out.target_outlet || '-'}</strong>
                </p>

                {out.doi_or_reg_number && (
                  <p className="text-xs text-orange-600 font-mono mt-1">
                    DOI / No. Reg: {out.doi_or_reg_number}
                  </p>
                )}
              </div>

              {out.projects?.title && (
                <div className="pt-2 border-t border-zinc-100">
                  <Link
                    href={`/projects/${out.project_id}?tab=outputs`}
                    className="text-[11px] font-mono text-zinc-500 hover:text-orange-600 truncate block"
                  >
                    Proyek: {out.projects.title}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
