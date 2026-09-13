import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

  const admin = createAdminClient();

  // 1. Ambil data proyek
  const { data: project, error: projectError } = await admin
    .from('projects')
    .select('*, created_by_profile:created_by(*)')
    .eq('id', id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // 2. Ambil seluruh belanja proyek ini
  const { data: expenses } = await admin
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
    <div className="min-h-screen bg-white text-zinc-950 p-8 sm:p-12 print:p-0 max-w-5xl mx-auto font-sans">
      {/* Tombol Cetak / Navigasi (Disembunyikan saat dicetak) */}
      <div className="mb-8 flex items-center justify-between print:hidden border-b border-zinc-200 pb-4">
        <a
          href={`/projects/${id}?tab=expenses`}
          className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          ← Kembali ke Workspace Proyek
        </a>
        <PrintButton />
      </div>

      {/* Kop Dokumen SPJ */}
      <div className="text-center border-b-2 border-zinc-950 pb-4 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-600">
          Sistem Informasi Manajemen Riset & Inovasi Perguruan Tinggi
        </h2>
        <h1 className="text-lg font-black uppercase tracking-wider mt-1 text-zinc-950">
          Buku Pembantu Kas & Rekapitulasi Pertanggungjawaban Belanja (SPJ)
        </h1>
        <p className="text-[11px] font-mono text-zinc-500 mt-1">
          Format Standar Akuntabilitas Belanja Riset Berbasis Standar Biaya Masukan (SBM)
        </p>
      </div>

      {/* Rincian Metadata Riset */}
      <div className="text-xs space-y-1.5 mb-6 bg-zinc-50 print:bg-transparent p-4 print:p-0 rounded-lg border print:border-0 border-zinc-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-zinc-600">Judul Penelitian</span>
          <span className="sm:col-span-3 font-semibold text-zinc-950">: {project.title}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-zinc-600">Skema Pendanaan</span>
          <span className="sm:col-span-3">: {schemeNames[project.scheme] || project.scheme} (TA {project.fiscal_year})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-zinc-600">Ketua Peneliti</span>
          <span className="sm:col-span-3 font-bold">: {project.created_by_profile?.full_name} (NIDN: {project.created_by_profile?.nidn_nim || '-'})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-zinc-600">Total Pagu Anggaran</span>
          <span className="sm:col-span-3 font-mono font-bold text-zinc-950">: Rp {Number(project.total_budget).toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Tabel Rincian Belanja */}
      <div className="border border-zinc-950 mb-6">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-100 border-b border-zinc-950 font-bold text-zinc-950 uppercase text-[10px]">
            <tr>
              <th className="p-2 border-r border-zinc-950 text-center w-8">No</th>
              <th className="p-2 border-r border-zinc-950 w-24">Tanggal</th>
              <th className="p-2 border-r border-zinc-950">Uraian Pengeluaran Barang / Jasa</th>
              <th className="p-2 border-r border-zinc-950 text-right w-28">Bruto (Rp)</th>
              <th className="p-2 border-r border-zinc-950 text-right w-24">Pajak (Rp)</th>
              <th className="p-2 border-r border-zinc-950 text-right w-28">Netto (Rp)</th>
              <th className="p-2 text-center w-20">Kuitansi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-300">
            {!expenses || expenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center italic text-zinc-500">
                  Belum ada transaksi pengeluaran belanja yang tercatat.
                </td>
              </tr>
            ) : (
              expenses.map((exp, idx) => (
                <tr key={exp.id} className="text-zinc-800">
                  <td className="p-2 border-r border-zinc-950 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border-r border-zinc-950 whitespace-nowrap font-mono">{exp.expense_date}</td>
                  <td className="p-2 border-r border-zinc-950">
                    <p className="font-semibold text-zinc-950">{exp.description}</p>
                    {exp.budget_item && (
                      <p className="text-[10px] text-zinc-500 uppercase tracking-tight font-mono">
                        Pos: {exp.budget_item.category.replace(/_/g, ' ')}
                      </p>
                    )}
                  </td>
                  <td className="p-2 border-r border-zinc-950 text-right font-mono">
                    {Number(exp.gross_amount).toLocaleString('id-ID')}
                  </td>
                  <td className="p-2 border-r border-zinc-950 text-right font-mono text-zinc-700">
                    {exp.tax_amount > 0 ? Number(exp.tax_amount).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="p-2 border-r border-zinc-950 text-right font-mono font-bold text-zinc-950">
                    {Number(exp.net_amount || exp.gross_amount).toLocaleString('id-ID')}
                  </td>
                  <td className="p-2 text-center text-[10px] uppercase font-mono font-bold text-zinc-900">
                    {exp.receipt_cloudinary_url ? 'Terlampir' : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="border-t-2 border-zinc-950 bg-zinc-50 font-bold">
            <tr>
              <td colSpan={3} className="p-2 text-right border-r border-zinc-950 uppercase text-[10px]">
                Total Realisasi Pengeluaran:
              </td>
              <td className="p-2 text-right border-r border-zinc-950 font-mono">
                Rp {totalGross.toLocaleString('id-ID')}
              </td>
              <td className="p-2 text-right border-r border-zinc-950 font-mono text-zinc-700">
                Rp {totalTax.toLocaleString('id-ID')}
              </td>
              <td className="p-2 text-right border-r border-zinc-950 font-mono text-zinc-950">
                Rp {totalNet.toLocaleString('id-ID')}
              </td>
              <td className="p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Ringkasan Saldo */}
      <div className="flex justify-end text-xs mb-8">
        <div className="w-64 border border-zinc-300 p-3 rounded-lg bg-zinc-50 print:bg-transparent font-mono">
          <div className="flex justify-between py-0.5">
            <span className="text-zinc-600">Pagu Anggaran:</span>
            <span className="font-bold text-zinc-950">Rp {Number(project.total_budget).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between py-0.5 text-zinc-700">
            <span>Total Belanja:</span>
            <span className="font-bold">(Rp {totalGross.toLocaleString('id-ID')})</span>
          </div>
          <div className="flex justify-between py-1 border-t border-zinc-300 font-black text-zinc-950">
            <span>Sisa Pagu:</span>
            <span>Rp {Math.max(0, Number(project.total_budget) - totalGross).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Lembar Pengesahan */}
      <div className="grid grid-cols-2 gap-8 text-center text-xs pt-6">
        <div>
          <p className="text-zinc-600 mb-16">
            Mengetahui / Memeriksa,<br />
            <strong>Pengelola Keuangan / Auditor LPPM</strong>
          </p>
          <div className="border-b border-zinc-950 w-48 mx-auto"></div>
          <p className="mt-1 font-bold">Staf Verifikator Keuangan</p>
          <p className="text-[10px] text-zinc-500 font-mono">NIP / NIK. ........................................</p>
        </div>

        <div>
          <p className="text-zinc-600 mb-16">
            Kota Peneliti, {currentDateFormatted}<br />
            <strong>Ketua Peneliti (PI)</strong>
          </p>
          <div className="border-b border-zinc-950 w-48 mx-auto"></div>
          <p className="mt-1 font-bold">{project.created_by_profile?.full_name}</p>
          <p className="text-[10px] text-zinc-500 font-mono">
            NIDN: {project.created_by_profile?.nidn_nim || '........................................'}
          </p>
        </div>
      </div>
    </div>
  );
}
