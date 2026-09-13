import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PartnerListClient from './PartnerListClient';
import { Users, Handshake, Building2 } from 'lucide-react';

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
      <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Mitra Kolaborasi Riset
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola basis data mitra industri, instansi pemerintah, dan dokumen legal kerja sama (MoU/MoA).
          </p>
        </div>
      </div>

      <PartnerListClient initialPartners={partners || []} />
    </DashboardLayout>
  );
}
