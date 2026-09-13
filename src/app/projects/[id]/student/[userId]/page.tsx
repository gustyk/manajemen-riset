import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import PrintButton from '@/app/projects/[id]/spj/print/PrintButton';

export const dynamic = 'force-dynamic';

export default async function StudentPortfolioPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  const { id, userId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const admin = createAdminClient();

  // 1. Ambil data proyek
  const { data: project } = await admin
    .from('projects')
    .select('*, created_by_profile:created_by(*)')
    .eq('id', id)
    .single();

  if (!project) notFound();

  // 2. Ambil profil mahasiswa
  const { data: student } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!student) notFound();

  // 3. Ambil seluruh logbook mahasiswa di proyek ini
  const { data: logbooks } = await admin
    .from('logbooks')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', userId)
    .order('activity_date', { ascending: true });

  // 4. Ambil tugas yang ditugaskan ke mahasiswa ini
  const { data: tasks } = await admin
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .eq('assigned_to', userId);

  const approvedLogs = logbooks?.filter((l) => l.status === 'approved') || [];
  const totalHours = approvedLogs.reduce((acc, l) => acc + (Number(l.hours_spent) || 0), 0);
  const completedTasks = tasks?.filter((t) => t.status === 'done').length || 0;

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 sm:p-12 print:p-0 max-w-5xl mx-auto font-serif">
      {/* Navigasi / Cetak */}
      <div className="mb-8 flex items-center justify-between print:hidden border-b border-slate-200 pb-4">
        <a
          href={`/projects/${id}?tab=logbooks`}
          className="text-xs font-sans font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Kembali ke Workspace Proyek
        </a>
        <PrintButton />
      </div>

      {/* Kop Portofolio */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h2 className="text-base font-bold uppercase tracking-wide">
          Program Studi Sistem Informasi
        </h2>
        <h1 className="text-xl font-black uppercase tracking-wider mt-1">
          Portofolio Riset & Surat Rekomendasi Konversi MBKM / Skripsi
        </h1>
        <p className="text-xs italic text-slate-600 mt-1">
          Bukti Sah Keterlibatan Mahasiswa sebagai Asisten Peneliti
        </p>
      </div>

      {/* Identitas Mahasiswa & Proyek */}
      <div className="text-xs font-sans space-y-1.5 mb-6 bg-slate-50 print:bg-transparent p-4 print:p-0 rounded-xl border print:border-0 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-slate-600">Nama Mahasiswa (RA)</span>
          <span className="sm:col-span-3 font-bold text-slate-900">: {student.full_name}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-slate-600">NIM / NIK</span>
          <span className="sm:col-span-3 font-mono">: {student.nidn_nim || '-'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-slate-600">Judul Riset Terkait</span>
          <span className="sm:col-span-3 font-semibold">: {project.title}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-slate-600">Dosen Pembimbing / PI</span>
          <span className="sm:col-span-3 font-bold">: {project.created_by_profile?.full_name} (NIDN: {project.created_by_profile?.nidn_nim || '-'})</span>
        </div>
      </div>

      {/* Kartu Statistik Kontribusi */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-xs font-sans print:border print:border-slate-900 print:rounded-lg">
        <div className="p-3 bg-slate-50 print:bg-transparent border border-slate-200 print:border-0 rounded-xl text-center">
          <span className="font-bold text-slate-500 block uppercase text-[10px]">Total Jam Kerja Riil</span>
          <span className="text-xl font-black text-indigo-700">{totalHours} Jam</span>
        </div>
        <div className="p-3 bg-slate-50 print:bg-transparent border border-slate-200 print:border-0 rounded-xl text-center">
          <span className="font-bold text-slate-500 block uppercase text-[10px]">Logbook Diverifikasi</span>
          <span className="text-xl font-black text-emerald-700">{approvedLogs.length} Aktivitas</span>
        </div>
        <div className="p-3 bg-slate-50 print:bg-transparent border border-slate-200 print:border-0 rounded-xl text-center">
          <span className="font-bold text-slate-500 block uppercase text-[10px]">Milestone Diselesaikan</span>
          <span className="text-xl font-black text-slate-900">{completedTasks} Task</span>
        </div>
      </div>

      {/* Tabel Rincian Logbook Kegiatan */}
      <div className="border border-slate-900 mb-6">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-100 border-b border-slate-900 font-bold text-slate-900 uppercase">
            <tr>
              <th className="p-2 border-r border-slate-900 text-center w-8">No</th>
              <th className="p-2 border-r border-slate-900 w-24">Tanggal</th>
              <th className="p-2 border-r border-slate-900">Uraian Aktivitas Pengerjaan & Kontribusi</th>
              <th className="p-2 border-r border-slate-900 text-center w-16">Durasi</th>
              <th className="p-2 text-center w-24">Verifikasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {!logbooks || logbooks.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center italic text-slate-500">
                  Belum ada catatan logbook kegiatan.
                </td>
              </tr>
            ) : (
              logbooks.map((log, idx) => (
                <tr key={log.id} className="text-slate-800">
                  <td className="p-2 border-r border-slate-900 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-900 whitespace-nowrap">{log.activity_date}</td>
                  <td className="p-2 border-r border-slate-900">
                    <p className="text-slate-900">{log.activity_description}</p>
                    {log.evidence_url && (
                      <p className="text-[10px] text-indigo-700 font-mono mt-0.5 truncate max-w-md">
                        Bukti/Git: {log.evidence_url}
                      </p>
                    )}
                  </td>
                  <td className="p-2 border-r border-slate-900 text-center font-bold">{log.hours_spent} Jam</td>
                  <td className="p-2 text-center font-bold text-[10px] uppercase">
                    <span className={log.status === 'approved' ? 'text-emerald-700' : 'text-slate-500'}>
                      {log.status === 'approved' ? 'Disetujui' : log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lembar Tanda Tangan & Konversi SKS */}
      <div className="grid grid-cols-2 gap-8 text-center text-xs font-sans pt-6">
        <div>
          <p className="text-slate-600 mb-16">
            Mahasiswa Peneliti (RA),<br />
            <strong>Yang Bersangkutan</strong>
          </p>
          <div className="border-b border-slate-900 w-48 mx-auto"></div>
          <p className="mt-1 font-bold">{student.full_name}</p>
          <p className="text-[10px] text-slate-500">NIM: {student.nidn_nim || '........................................'}</p>
        </div>

        <div>
          <p className="text-slate-600 mb-16">
            Kota Peneliti, {currentDateFormatted}<br />
            <strong>Dosen Pembimbing / Ketua Peneliti (PI)</strong>
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
