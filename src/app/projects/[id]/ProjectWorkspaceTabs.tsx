'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  createTask,
  updateTaskStatus,
  submitLogbook,
  verifyLogbook,
  testTelegramPing,
} from './actions';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Receipt,
  Bell,
  Plus,
  Send,
  Calendar,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface ProjectWorkspaceTabsProps {
  projectId: string;
  currentTab: string;
  isPI: boolean;
  project: any;
  members: any[];
  tasks: any[];
  logbooks: any[];
  budgetItems: any[];
  expenses: any[];
  notificationRules: any[];
}

export default function ProjectWorkspaceTabs({
  projectId,
  currentTab,
  isPI,
  project,
  members,
  tasks,
  logbooks,
  budgetItems,
  expenses,
  notificationRules,
}: ProjectWorkspaceTabsProps) {
  const [activeTab, setActiveTab] = useState(currentTab || 'overview');
  const [loading, setLoading] = useState(false);
  const [pingResult, setPingResult] = useState<{ success?: boolean; error?: string } | null>(null);

  // State untuk form task baru
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLogbookModal, setShowLogbookModal] = useState(false);

  // Handler test ping telegram
  async function handleTestPing() {
    setLoading(true);
    setPingResult(null);
    try {
      const res = await testTelegramPing(projectId);
      if (res.error) {
        setPingResult({ error: res.error });
      } else {
        setPingResult({ success: true });
      }
    } catch (err: any) {
      setPingResult({ error: err.message || 'Gagal mengirim pengingat' });
    } finally {
      setLoading(false);
    }
  }

  // Handler create task
  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('projectId', projectId);
    await createTask(formData);
    setLoading(false);
    setShowTaskModal(false);
  }

  // Handler submit logbook
  async function handleSubmitLogbook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('projectId', projectId);
    await submitLogbook(formData);
    setLoading(false);
    setShowLogbookModal(false);
  }

  const tabs = [
    { id: 'overview', label: 'Ringkasan & Tim', icon: LayoutDashboard },
    { id: 'tasks', label: `Tugas & WBS (${tasks.length})`, icon: CheckSquare },
    { id: 'logbooks', label: `Logbook Mahasiswa (${logbooks.length})`, icon: BookOpen },
    { id: 'expenses', label: `Keuangan & SPJ (${expenses.length})`, icon: Receipt },
    { id: 'telegram', label: `Pengingat Telegram (${notificationRules.length})`, icon: Bell },
  ];

  const totalSpent = expenses.reduce((acc, exp) => acc + (Number(exp.gross_amount) || 0), 0);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-6 shadow-xs">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Anggota Tim Riset */}
              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Susunan Tim Peneliti & Mahasiswa</span>
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {members.length} Anggota
                  </span>
                </div>

                <div className="space-y-3">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {m.profile?.full_name || 'Anggota Riset'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          NIDN/NIM: {m.profile?.nidn_nim || '-'}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {m.role.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Integrasi Telegram Grup */}
              <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-600" />
                      <span>Kanal Bot Telegram Proyek</span>
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        project.telegram_group_id
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {project.telegram_group_id ? 'Grup Terhubung' : 'Belum Terhubung'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Chat ID Grup Telegram saat ini:{' '}
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      {project.telegram_group_id || 'Belum diisi'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Bot <span className="font-semibold text-indigo-600">@SimRisetReminderBot</span> akan
                    mengirimkan rekap otomatis pengingat batas waktu dokumen dan logbook baru mahasiswa ke
                    grup ini.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => setActiveTab('telegram')}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    Buka Konfigurasi Pengingat & Uji Ping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TASKS / WBS */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Work Breakdown Structure (WBS)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tugas dan milestone pengerjaan riset & software artefak SI.
                </p>
              </div>
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tugas</span>
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Belum ada tugas dibuat</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Klik "Tambah Tugas" untuk membagi milestone riset Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 shadow-2xs flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            task.status === 'done'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.status}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString('id-ID')}
                          </span>
                        )}
                        <span>
                          PIC: {task.assigned_profile?.full_name || 'Belum ditugaskan'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.status !== 'done' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, projectId, 'done')}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          Selesai
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LOGBOOKS */}
        {activeTab === 'logbooks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Catatan Kegiatan Riset & Mahasiswa</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekam jejak aktivitas harian asisten peneliti beserta verifikasi dosen pembimbing.
                </p>
              </div>
              <button
                onClick={() => setShowLogbookModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Isi Logbook Baru</span>
              </button>
            </div>

            {logbooks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Belum ada catatan logbook</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mahasiswa atau asisten peneliti dapat mengisi kemajuan harian di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logbooks.map((log) => (
                  <div
                    key={log.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-900">
                          {log.student_profile?.full_name || 'Asisten Peneliti'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {log.activity_date}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {log.hours_spent} Jam
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          log.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {log.activity_description}
                    </p>

                    {log.evidence_url && (
                      <div className="pt-1">
                        <a
                          href={log.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Tautan Bukti Hasil / Commit Git</span>
                        </a>
                      </div>
                    )}

                    {/* Feedback & Verifikasi Dosen */}
                    {isPI && log.status === 'submitted' && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => verifyLogbook(log.id, projectId, 'approved')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => verifyLogbook(log.id, projectId, 'rejected')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Perlu Revisi</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EXPENSES & SPJ */}
        {activeTab === 'expenses' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Realisasi Anggaran & Pertanggungjawaban (SPJ)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pencatatan nota kuitansi tersimpan di Cloudinary dan siap diekspor untuk audit.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  Total Serapan: Rp {totalSpent.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {expenses.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Belum ada kuitansi dicatat</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Foto nota belanja tersimpan aman di Cloudinary dengan kompresi otomatis.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{exp.description}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tanggal: {exp.expense_date} • Pajak: {exp.tax_type.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 block">
                        Rp {Number(exp.gross_amount).toLocaleString('id-ID')}
                      </span>
                      {exp.receipt_cloudinary_url && (
                        <a
                          href={exp.receipt_cloudinary_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Lihat Kuitansi</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TELEGRAM REMINDERS */}
        {activeTab === 'telegram' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-600" />
                  <span>Uji Coba Pengiriman Pengingat Telegram</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Kirim pesan instan ke Chat ID grup{' '}
                  <span className="font-mono font-bold text-slate-900">
                    {project.telegram_group_id || '(Belum disetel)'}
                  </span>{' '}
                  untuk memastikan bot aktif.
                </p>
              </div>

              <button
                onClick={handleTestPing}
                disabled={loading || !project.telegram_group_id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Test Ping Sekarang</span>
                  </>
                )}
              </button>
            </div>

            {pingResult && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  pingResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {pingResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Berhasil! Pesan pengingat telah dikirim ke grup Telegram proyek Anda oleh{' '}
                      <strong>@SimRisetReminderBot</strong>.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Gagal: {pingResult.error}</span>
                  </>
                )}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Aturan Pengingat Otomatis Aktif (Rules Engine)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Agenda Target</th>
                      <th className="px-4 py-3">Pemicu Waktu</th>
                      <th className="px-4 py-3">Waktu Eksekusi</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notificationRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {rule.event_type === 'interim_report'
                            ? 'Laporan Kemajuan / Monev'
                            : rule.event_type === 'final_report'
                            ? 'Laporan Akhir Riset'
                            : rule.event_type}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          H{rule.trigger_offset_days} ({Math.abs(rule.trigger_offset_days)} Hari Sebelum Deadline)
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {rule.dispatch_time} WIB
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            AKTIF
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Tambah Milestone / Tugas Riset</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Tugas</label>
                <input
                  name="title"
                  required
                  placeholder="Contoh: Perancangan Schema ERD & DDL"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Rincian lingkup tugas"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Waktu (Deadline)</label>
                <input
                  name="dueDate"
                  type="date"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Penugasan (PIC)</label>
                <select
                  name="assignedTo"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Anggota Tim --</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profile?.full_name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Logbook */}
      {showLogbookModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Isi Catatan Logbook Aktivitas</h3>
            <form onSubmit={handleSubmitLogbook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Kegiatan</label>
                <input
                  name="activityDate"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Uraian Aktivitas Riset</label>
                <textarea
                  name="activityDescription"
                  rows={3}
                  required
                  placeholder="Uraikan hasil pengerjaan, eksperimen data, atau modul software yang diselesaikan hari ini."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi (Jam)</label>
                  <input
                    name="hoursSpent"
                    type="number"
                    defaultValue={2}
                    min={1}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Link Bukti / Git</label>
                  <input
                    name="evidenceUrl"
                    type="url"
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogbookModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Kirim Logbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
