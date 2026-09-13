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
    <div className="min-h-screen bg-white text-zinc-950 p-8 sm:p-12 print:p-0 max-w-5xl mx-auto font-sans">
      {/* Navigasi / Cetak */}
      <div className="mb-8 flex items-center justify-between print:hidden border-b border-zinc-200 pb-4">
        <a
          href={`/projects/${id}?tab=logbooks`}
          className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          ← Kembali ke Workspace Proyek
        </a>
        <PrintButton />
      </div>

      {/* Kop Portofolio */}
      <div className="text-center border-b-2 border-zinc-950 pb-4 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-600">
          Program Studi Sistem Informasi • MBKM Riset
        </h2>
        <h1 className="text-lg font-black uppercase tracking-wider mt-1 text-zinc-950">
          Portofolio Aktivitas Riset & Surat Rekomendasi Ekuivalensi SKS
        </h1>
        <p className="text-[11px] font-mono text-zinc-500 mt-1">
          Bukti Sah Keterlibatan Mahasiswa sebagai Asisten Peneliti (Research Assistant)
        </p>
      </div>

      {/* Identitas Mahasiswa & Proyek */}
      <div className="text-xs space-y-1.5 mb-6 bg-zinc-50 print:bg-transparent p-4 print:p-0 rounded-lg border print:border-0 border-zinc-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-zinc-600">Nama Mahasiswa (RA)</span>
          <span className="sm:col-span-3 font-bold text-zinc-950">: {student.full_name}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-zinc-600">NIM</span>
          <span className="sm:col-span-3 font-mono font-semibold">: {student.nidn_nim || '-'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-zinc-600">Judul Riset Terkait</span>
          <span className="sm:col-span-3 font-semibold text-zinc-900">: {project.title}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
          <span className="font-bold text-zinc-600">Dosen Pembimbing / PI</span>
          <span className="sm:col-span-3 font-bold">: {project.created_by_profile?.full_name} (NIDN: {project.created_by_profile?.nidn_nim || '-'})</span>
        </div>
      </div>

      {/* Kartu Statistik Kontribusi */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-xs print:border print:border-zinc-950 print:rounded-lg">
        <div className="p-3 bg-zinc-50 print:bg-transparent border border-zinc-200 print:border-0 rounded-lg text-center">
          <span className="font-bold text-zinc-500 block uppercase text-[10px]">Total Jam Kerja Riil</span>
          <span className="text-xl font-black text-orange-600 font-mono">{totalHours} Jam</span>
        </div>
        <div className="p-3 bg-zinc-50 print:bg-transparent border border-zinc-200 print:border-0 rounded-lg text-center">
          <span className="font-bold text-zinc-500 block uppercase text-[10px]">Logbook Diverifikasi</span>
          <span className="text-xl font-black text-zinc-950 font-mono">{approvedLogs.length} Aktivitas</span>
        </div>
        <div className="p-3 bg-zinc-50 print:bg-transparent border border-zinc-200 print:border-0 rounded-lg text-center">
          <span className="font-bold text-zinc-500 block uppercase text-[10px]">Milestone Diselesaikan</span>
          <span className="text-xl font-black text-zinc-950 font-mono">{completedTasks} Task</span>
        </div>
      </div>

      {/* Tabel Rincian Logbook Kegiatan */}
      <div className="border border-zinc-950 mb-6">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-100 border-b border-zinc-950 font-bold text-zinc-950 uppercase text-[10px]">
            <tr>
              <th className="p-2 border-r border-zinc-950 text-center w-8">No</th>
              <th className="p-2 border-r border-zinc-950 w-24">Tanggal</th>
              <th className="p-2 border-r border-zinc-950">Uraian Aktivitas Pengerjaan & Kontribusi</th>
              <th className="p-2 border-r border-zinc-950 text-center w-16">Durasi</th>
              <th className="p-2 text-center w-24">Verifikasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-300">
            {!logbooks || logbooks.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center italic text-zinc-500">
                  Belum ada catatan logbook kegiatan.
                </td>
              </tr>
            ) : (
              logbooks.map((log, idx) => (
                <tr key={log.id} className="text-zinc-800">
                  <td className="p-2 border-r border-zinc-950 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border-r border-zinc-950 whitespace-nowrap font-mono">{log.activity_date}</td>
                  <td className="p-2 border-r border-zinc-950">
                    <p className="text-zinc-950">{log.activity_description}</p>
                    {log.evidence_url && (
                      <p className="text-[10px] text-orange-600 font-mono mt-0.5 truncate max-w-md">
                        Bukti/Git: {log.evidence_url}
                      </p>
                    )}
                  </td>
                  <td className="p-2 border-r border-zinc-950 text-center font-mono font-bold">{log.hours_spent} Jam</td>
                  <td className="p-2 text-center font-mono font-bold text-[10px] uppercase">
                    <span className={log.status === 'approved' ? 'text-zinc-900' : 'text-zinc-400'}>
                      {log.status === 'approved' ? 'Disetujui' : log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lembar Tanda Tangan */}
      <div className="grid grid-cols-2 gap-8 text-center text-xs pt-6">
        <div>
          <p className="text-zinc-600 mb-16">
            Mahasiswa Peneliti (RA),<br />
            <strong>Yang Bersangkutan</strong>
          </p>
          <div className="border-b border-zinc-950 w-48 mx-auto"></div>
          <p className="mt-1 font-bold">{student.full_name}</p>
          <p className="text-[10px] text-zinc-500 font-mono">NIM: {student.nidn_nim || '........................................'}</p>
        </div>

        <div>
          <p className="text-zinc-600 mb-16">
            Kota Peneliti, {currentDateFormatted}<br />
            <strong>Dosen Pembimbing / Ketua Peneliti (PI)</strong>
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
