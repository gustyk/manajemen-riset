import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { Receipt, Wallet, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .maybeSingle();

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, projects(*)')
    .order('expense_date', { ascending: false });

  const totalSpent = expenses?.reduce((acc, e) => acc + (Number(e.gross_amount) || 0), 0) || 0;
  const totalTax = expenses?.reduce((acc, e) => acc + (Number(e.tax_amount) || 0), 0) || 0;

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
            Surat Pertanggungjawaban (SPJ) & Keuangan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Rekapitulasi seluruh realisasi belanja riset dengan bukti kuitansi terarsip aman di Cloudinary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Realisasi
            </span>
            <span className="text-base font-black text-slate-900">
              Rp {totalSpent.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {!expenses || expenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Catatan Belanja</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Setiap kuitansi yang dicatat pada workspace proyek akan otomatis terhimpun dan siap diekspor ke format SPJ.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Proyek Riset</th>
                <th className="px-5 py-3.5">Uraian Belanja</th>
                <th className="px-5 py-3.5">Pajak</th>
                <th className="px-5 py-3.5 text-right">Nominal Bruto</th>
                <th className="px-5 py-3.5 text-center">Bukti Kuitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{exp.expense_date}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900 max-w-xs truncate">
                    <Link
                      href={`/projects/${exp.project_id}?tab=expenses`}
                      className="hover:text-indigo-600 hover:underline"
                    >
                      {exp.projects?.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{exp.description}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 uppercase text-[10px]">
                      {exp.tax_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    Rp {Number(exp.gross_amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {exp.receipt_cloudinary_url ? (
                      <a
                        href={exp.receipt_cloudinary_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        <span>Lihat Nota</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
