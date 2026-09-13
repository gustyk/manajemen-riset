import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { Receipt, ExternalLink } from 'lucide-react';

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
      <div className="border-b border-zinc-200 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-600"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Pertanggungjawaban Keuangan (SPJ)
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
            Rekapitulasi Belanja Riset Berbasis SBM
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Arsip terpusat seluruh bukti kuitansi digital Cloudinary dan pemotongan pajak (PPh 21/23/PPN).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block tracking-wider">
              Total Realisasi Belanja
            </span>
            <span className="text-base font-black text-zinc-950 font-mono">
              Rp {totalSpent.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {!expenses || expenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-200">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">Belum Ada Catatan Belanja</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Setiap kuitansi yang dicatat pada workspace proyek akan otomatis terhimpun dan siap dicetak ke Buku Kas Pembantu SPJ.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Proyek Riset</th>
                <th className="px-4 py-3">Uraian Belanja</th>
                <th className="px-4 py-3">Pajak</th>
                <th className="px-4 py-3 text-right">Nominal Bruto</th>
                <th className="px-4 py-3 text-center">Bukti Kuitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-zinc-600 whitespace-nowrap">{exp.expense_date}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-900 max-w-xs truncate">
                    <Link
                      href={`/projects/${exp.project_id}?tab=expenses`}
                      className="hover:text-orange-600 hover:underline"
                    >
                      {exp.projects?.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{exp.description}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono font-bold text-zinc-800 uppercase text-[10px] border border-zinc-200">
                      {exp.tax_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-zinc-950 whitespace-nowrap">
                    Rp {Number(exp.gross_amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {exp.receipt_cloudinary_url ? (
                      <a
                        href={exp.receipt_cloudinary_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline font-mono"
                      >
                        <span>Nota</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-zinc-400 font-mono">-</span>
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
