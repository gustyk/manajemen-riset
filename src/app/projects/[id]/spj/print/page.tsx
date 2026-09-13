import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

export default async function SpjPrintPage({
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

  // 1. Ambil data proyek
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, created_by_profile:created_by(*)')
    .eq('id', id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // 2. Ambil seluruh belanja proyek ini
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, budget_item:budget_item_id(*)')
    .eq('project_id', id)
    .order('expense_date', { ascending: true });

  const totalGross = expenses?.reduce((acc, e) => acc + Number(e.gross_amount), 0) || 0;
  const totalTax = expenses?.reduce((acc, e) => acc + Number(e.tax_amount), 0) || 0;
  const totalNet = totalGross - totalTax;

  const schemeNames: Record<string, string> = {
    kemdikbud_bima: 'Hibah Kemdikbudristek (BIMA)',
    brin: 'Hibah Riset BRIN',
    internal_kampus: 'Hibah Internal Perguruan Tinggi',
    matching_fund: 'Matching Fund Kedaireka',
    industri: 'Kerja Sama Industri',
    mandiri: 'Penelitian Mandiri',
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 sm:p-12 print:p-0 max-w-5xl mx-auto font-serif">
      {/* Tombol Cetak / Navigasi (Disembunyikan saat dicetak) */}
      <div className="mb-8 flex items-center justify-between print:hidden border-b border-slate-200 pb-4">
        <a
          href={`/projects/${id}?tab=expenses`}
          className="text-xs font-sans font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Kembali ke Workspace Proyek
        </a>
        <PrintButton />
      </div>

      {/* Kop Dokumen SPJ */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h2 className="text-base font-bold uppercase tracking-wide">
          Sistem Informasi Manajemen Riset & Pengabdian
        </h2>
        <h1 className="text-xl font-black uppercase tracking-wider mt-1">
          Buku Pembantu Kas & Rekapitulasi Pertanggungjawaban Belanja (SPJ)
        </h1>
        <p className="text-xs italic text-slate-600 mt-1">
          Format Standar Akuntabilitas Belanja Riset Perguruan Tinggi
        </p>
      </div>

      {/* Rincian Metadata Riset */}
      <div className="text-xs font-sans space-y-1.5 mb-6 bg-slate-50 print:bg-transparent p-4 print:p-0 rounded-xl border print:border-0 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-slate-600">Judul Penelitian</span>
          <span className="sm:col-span-3 font-semibold text-slate-900">: {project.title}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-slate-600">Skema Pendanaan</span>
          <span className="sm:col-span-3">: {schemeNames[project.scheme] || project.scheme} (TA {project.fiscal_year})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-slate-600">Ketua Peneliti</span>
          <span className="sm:col-span-3 font-bold">: {project.created_by_profile?.full_name} (NIDN: {project.created_by_profile?.nidn_nim || '-'})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-slate-600">Total Pagu Anggaran</span>
          <span className="sm:col-span-3 font-bold text-indigo-900">: Rp {Number(project.total_budget).toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Tabel Rincian Belanja */}
      <div className="border border-slate-900 mb-6">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-100 border-b border-slate-900 font-bold text-slate-900 uppercase">
            <tr>
              <th className="p-2 border-r border-slate-900 text-center w-8">No</th>
              <th className="p-2 border-r border-slate-900 w-24">Tanggal</th>
              <th className="p-2 border-r border-slate-900">Uraian Pengeluaran Barang / Jasa</th>
              <th className="p-2 border-r border-slate-900 text-right w-28">Bruto (Rp)</th>
              <th className="p-2 border-r border-slate-900 text-right w-24">Pajak (Rp)</th>
              <th className="p-2 border-r border-slate-900 text-right w-28">Netto (Rp)</th>
              <th className="p-2 text-center w-20">Kuitansi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {!expenses || expenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center italic text-slate-500">
                  Belum ada transaksi pengeluaran belanja yang tercatat.
                </td>
              </tr>
            ) : (
              expenses.map((exp, idx) => (
                <tr key={exp.id} className="text-slate-800">
                  <td className="p-2 border-r border-slate-900 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-900 whitespace-nowrap">{exp.expense_date}</td>
                  <td className="p-2 border-r border-slate-900">
                    <p className="font-semibold text-slate-900">{exp.description}</p>
                    {exp.budget_item && (
                      <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                        Pos: {exp.budget_item.category.replace(/_/g, ' ')}
                      </p>
                    )}
                  </td>
                  <td className="p-2 border-r border-slate-900 text-right font-mono">
                    {Number(exp.gross_amount).toLocaleString('id-ID')}
                  </td>
                  <td className="p-2 border-r border-slate-900 text-right font-mono text-red-700">
                    {exp.tax_amount > 0 ? Number(exp.tax_amount).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="p-2 border-r border-slate-900 text-right font-mono font-bold text-slate-900">
                    {Number(exp.net_amount || exp.gross_amount).toLocaleString('id-ID')}
                  </td>
                  <td className="p-2 text-center text-[10px] uppercase font-bold text-emerald-800">
                    {exp.receipt_cloudinary_url ? 'Terlampir' : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-bold">
            <tr>
              <td colSpan={3} className="p-2 text-right border-r border-slate-900 uppercase">
                Total Realisasi Pengeluaran:
              </td>
              <td className="p-2 text-right border-r border-slate-900 font-mono">
                Rp {totalGross.toLocaleString('id-ID')}
              </td>
              <td className="p-2 text-right border-r border-slate-900 font-mono text-red-700">
                Rp {totalTax.toLocaleString('id-ID')}
              </td>
              <td className="p-2 text-right border-r border-slate-900 font-mono text-indigo-950">
                Rp {totalNet.toLocaleString('id-ID')}
              </td>
              <td className="p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Ringkasan Saldo */}
      <div className="flex justify-end text-xs font-sans mb-8">
        <div className="w-64 border border-slate-300 p-3 rounded-lg bg-slate-50 print:bg-transparent">
          <div className="flex justify-between py-0.5">
            <span>Pagu Anggaran:</span>
            <span className="font-bold">Rp {Number(project.total_budget).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between py-0.5 text-red-700">
            <span>Total Belanja:</span>
            <span className="font-bold">(Rp {totalGross.toLocaleString('id-ID')})</span>
          </div>
          <div className="flex justify-between py-1 border-t border-slate-300 font-black text-slate-900">
            <span>Sisa Anggaran:</span>
            <span>Rp {Math.max(0, Number(project.total_budget) - totalGross).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Lembar Pengesahan / Tanda Tangan */}
      <div className="grid grid-cols-2 gap-8 text-center text-xs font-sans pt-6">
        <div>
          <p className="text-slate-600 mb-16">
            Mengetahui / Memeriksa,<br />
            <strong>Pengelola Keuangan / LPPM</strong>
          </p>
          <div className="border-b border-slate-900 w-48 mx-auto"></div>
          <p className="mt-1 font-bold">Staf Verifikator Keuangan</p>
          <p className="text-[10px] text-slate-500">NIP / NIK. ........................................</p>
        </div>

        <div>
          <p className="text-slate-600 mb-16">
            Kota Peneliti, {currentDateFormatted}<br />
            <strong>Ketua Peneliti (PI)</strong>
          </p>
          <div className="border-b border-slate-900 w-48 mx-auto"></div>
          <p className="mt-1 font-bold">{project.created_by_profile?.full_name}</p>
          <p className="text-[10px] text-slate-500">
            NIDN: {project.created_by_profile?.nidn_nim || '........................................'}
          </p>
        </div>
      </div>
    </div>
  );
}
