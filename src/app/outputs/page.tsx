import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { FileCheck2, BookOpen, Award, Sparkles, ExternalLink } from 'lucide-react';

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
      <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pelacakan Luaran Riset & Publikasi
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring naskah jurnal (Scopus/Sinta), sertifikat HKI Hak Cipta perangkat lunak, dan prototipe sistem.
          </p>
        </div>
      </div>

      {!outputs || outputs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Luaran Terdaftar</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Setiap target publikasi atau pendaftaran HKI dapat dipantau status peer-review-nya secara berkesinambungan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {outputs.map((out) => (
            <div
              key={out.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {out.output_type.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold uppercase text-slate-500">
                  {out.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{out.title}</h4>
              <p className="text-xs text-slate-500">
                Target: <span className="font-semibold text-slate-700">{out.target_outlet || '-'}</span>
              </p>

              {out.doi_or_reg_number && (
                <p className="text-xs text-indigo-600 font-mono">
                  DOI/No. Reg: {out.doi_or_reg_number}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
