import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PartnerListClient from './PartnerListClient';

export const dynamic = 'force-dynamic';

export default async function PartnersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .maybeSingle();

  const { data: partners } = await supabase
    .from('partners')
    .select('*')
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
              Basis Data Kerja Sama Eksternal
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
            Direktori Mitra Riset & Industri
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Kelola data institusi mitra industri, BUMN/instansi pemerintah, dan legalitas dokumen kerja sama (MoU/MoA).
          </p>
        </div>
      </div>

      <PartnerListClient initialPartners={partners || []} />
    </DashboardLayout>
  );
}
