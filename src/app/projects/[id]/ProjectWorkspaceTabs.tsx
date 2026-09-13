'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  createTask,
  updateTaskStatus,
  submitLogbook,
  verifyLogbook,
  testTelegramPing,
  createBudgetItem,
  deleteBudgetItem,
  createExpense,
  deleteExpense,
  createNotificationRule,
  deleteNotificationRule,
  toggleNotificationRule,
  createResearchOutput,
  deleteResearchOutput,
  updateResearchOutputStatus,
  addProjectMember,
  removeProjectMember,
} from './actions';
import { updateTelegramGroupId } from '@/app/projects/actions';
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
  Upload,
  Trash2,
  Printer,
  PieChart,
  Award,
  Sparkles,
} from 'lucide-react';

interface ProjectWorkspaceTabsProps {
  projectId: string;
  currentTab: string;
  isPI: boolean;
  userRole?: string;
  currentUserId?: string;
  project: any;
  members: any[];
  tasks: any[];
  logbooks: any[];
  budgetItems: any[];
  expenses: any[];
  notificationRules: any[];
  outputs: any[];
}

export default function ProjectWorkspaceTabs({
  projectId,
  currentTab,
  isPI,
  userRole = 'pi',
  currentUserId,
  project,
  members,
  tasks,
  logbooks,
  budgetItems,
  expenses,
  notificationRules,
  outputs,
}: ProjectWorkspaceTabsProps) {
  const [activeTab, setActiveTab] = useState(currentTab || 'overview');
  const [loading, setLoading] = useState(false);
  const [pingResult, setPingResult] = useState<{ success?: boolean; error?: string } | null>(null);

  // State untuk form task baru
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLogbookModal, setShowLogbookModal] = useState(false);

  // State untuk Anggota Tim
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  // State untuk Keuangan & RAB
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetTab, setBudgetTab] = useState<'expenses' | 'rab'>('expenses');
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  async function handleCreateExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setExpenseLoading(true);
    setExpenseError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('projectId', projectId);
    try {
      const res = await createExpense(formData);
      if (res?.error) {
        setExpenseError(res.error);
      } else {
        setShowExpenseModal(false);
      }
    } catch (err: any) {
      setExpenseError(err.message || 'Gagal menyimpan realisasi belanja');
    } finally {
      setExpenseLoading(false);
    }
  }

  async function handleCreateBudgetItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBudgetLoading(true);
    setBudgetError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('projectId', projectId);
    try {
      const res = await createBudgetItem(formData);
      if (res?.error) {
        setBudgetError(res.error);
      } else {
        setShowBudgetModal(false);
      }
    } catch (err: any) {
      setBudgetError(err.message || 'Gagal menyimpan item RAB');
    } finally {
      setBudgetLoading(false);
    }
  }

  // State untuk edit Chat ID Telegram
  const [chatIdInput, setChatIdInput] = useState(project.telegram_group_id?.toString() || '');
  const [chatIdLoading, setChatIdLoading] = useState(false);
  const [chatIdMessage, setChatIdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSaveChatId(e: React.FormEvent) {
    e.preventDefault();
    setChatIdLoading(true);
    setChatIdMessage(null);
    try {
      const res = await updateTelegramGroupId(projectId, chatIdInput);
      if (res?.error) {
        setChatIdMessage({ type: 'error', text: res.error });
      } else {
        setChatIdMessage({ type: 'success', text: 'Chat ID Grup Telegram berhasil disimpan!' });
        project.telegram_group_id = chatIdInput ? parseInt(chatIdInput, 10) : null;
      }
    } catch (err: any) {
      setChatIdMessage({ type: 'error', text: err.message || 'Gagal menyimpan Chat ID' });
    } finally {
      setChatIdLoading(false);
    }
  }

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

  // State untuk Luaran Riset & Aturan Pengingat
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [outputLoading, setOutputLoading] = useState(false);
  const [ruleLoading, setRuleLoading] = useState(false);
  const [outputError, setOutputError] = useState<string | null>(null);
  const [ruleError, setRuleError] = useState<string | null>(null);

  async function handleCreateOutput(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOutputLoading(true);
    setOutputError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('projectId', projectId);
    try {
      const res = await createResearchOutput(formData);
      if (res?.error) {
        setOutputError(res.error);
      } else {
        setShowOutputModal(false);
      }
    } catch (err: any) {
      setOutputError(err.message || 'Gagal menyimpan luaran riset');
    } finally {
      setOutputLoading(false);
    }
  }

  async function handleCreateRule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRuleLoading(true);
    setRuleError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('projectId', projectId);
    try {
      const res = await createNotificationRule(formData);
      if (res?.error) {
        setRuleError(res.error);
      } else {
        setShowRuleModal(false);
      }
    } catch (err: any) {
      setRuleError(err.message || 'Gagal menyimpan aturan pengingat');
    } finally {
      setRuleLoading(false);
    }
  }

  async function handleAddMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemberLoading(true);
    setMemberError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('projectId', projectId);
    try {
      const res = await addProjectMember(formData);
      if (res?.error) {
        setMemberError(res.error);
      } else {
        setShowMemberModal(false);
      }
    } catch (err: any) {
      setMemberError(err.message || 'Gagal menambahkan anggota');
    } finally {
      setMemberLoading(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota tim ini?')) return;
    try {
      const res = await removeProjectMember(memberId, projectId);
      if (res?.error) {
        alert(res.error);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus anggota');
    }
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'pi':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'co_pi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student_ra':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'partner':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'auditor':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'pi':
        return 'Ketua Peneliti (PI)';
      case 'co_pi':
        return 'Dosen Anggota (Co-PI)';
      case 'student_ra':
        return 'Mahasiswa RA / MBKM';
      case 'partner':
        return 'Mitra Industri / Partner';
      case 'auditor':
        return 'Auditor LPPM / Reviewer';
      default:
        return role;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Ringkasan & Tim', icon: LayoutDashboard },
    { id: 'tasks', label: `Tugas & WBS (${tasks.length})`, icon: CheckSquare },
    { id: 'logbooks', label: `Logbook Mahasiswa (${logbooks.length})`, icon: BookOpen },
    { id: 'expenses', label: `Keuangan & SPJ (${expenses.length})`, icon: Receipt },
    { id: 'outputs', label: `Publikasi & HKI (${outputs.length})`, icon: Award },
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
        {/* Active Role Indicator */}
        <div className="mb-6 px-4 py-3 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs border border-indigo-500/30 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Sesi Login Aktif / Peran Akses:</p>
              <h4 className="text-xs font-bold text-white tracking-wide">
                {getRoleLabel(userRole)}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
              userRole === 'pi' ? 'bg-purple-900/60 text-purple-300 border-purple-600' :
              userRole === 'co_pi' ? 'bg-blue-900/60 text-blue-300 border-blue-600' :
              userRole === 'student_ra' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-600' :
              userRole === 'auditor' ? 'bg-rose-900/60 text-rose-300 border-rose-600' :
              'bg-amber-900/60 text-amber-300 border-amber-600'
            }`}>
              Role: {userRole.toUpperCase()}
            </span>
          </div>
        </div>

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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {members.length} Anggota
                    </span>
                    {isPI && (
                      <button
                        onClick={() => setShowMemberModal(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Anggota</span>
                      </button>
                    )}
                  </div>
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
                          {m.profile?.nidn_nim ? `NIDN/NIM: ${m.profile.nidn_nim}` : m.profile?.institution || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeStyle(m.role)}`}>
                          {m.role.replace(/_/g, ' ')}
                        </span>
                        {m.role === 'student_ra' && (
                          <Link
                            href={`/projects/${projectId}/student/${m.user_id}`}
                            target="_blank"
                            className="text-[10px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                            title="Cetak Portofolio & Surat Konversi MBKM/Skripsi"
                          >
                            <span>Portofolio</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        {isPI && m.user_id !== currentUserId && (
                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus Anggota dari Proyek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
          <div className="space-y-6">
            {/* Budget Progress Bar */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Serapan Anggaran Riset
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-slate-900">
                      Rp {totalSpent.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-slate-500">
                      dari total pagu Rp {Number(project.total_budget).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-indigo-600">
                    {project.total_budget > 0
                      ? Math.round((totalSpent / Number(project.total_budget)) * 100)
                      : 0}
                    %
                  </span>
                  <span className="text-xs text-slate-500 block">Terserap</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      project.total_budget > 0
                        ? Math.round((totalSpent / Number(project.total_budget)) * 100)
                        : 0
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                <span>Sisa Pagu: Rp {Math.max(0, Number(project.total_budget) - totalSpent).toLocaleString('id-ID')}</span>
                <span>{expenses.length} Bukti Kuitansi Tersimpan di Cloudinary</span>
              </div>
            </div>

            {/* Sub-tab switcher & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setBudgetTab('expenses')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    budgetTab === 'expenses'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Realisasi Belanja & SPJ ({expenses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetTab('rab')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    budgetTab === 'rab'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Rencana Anggaran (RAB) ({budgetItems.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                {budgetTab === 'expenses' ? (
                  <>
                    <Link
                      href={`/projects/${projectId}/spj/print`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Format SPJ</span>
                    </Link>
                    <button
                      onClick={() => setShowExpenseModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Kuitansi Belanja</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowBudgetModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Item RAB</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content: Realisasi Belanja (SPJ) */}
            {budgetTab === 'expenses' && (
              <div>
                {expenses.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">Belum ada realisasi belanja dicatat</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Klik "Catat Kuitansi Belanja" untuk mengunggah bukti nota kuitansi pertama Anda.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Tanggal</th>
                          <th className="px-4 py-3">Uraian Belanja</th>
                          <th className="px-4 py-3">Pajak</th>
                          <th className="px-4 py-3 text-right">Nominal Bruto</th>
                          <th className="px-4 py-3 text-right">Nominal Bersih</th>
                          <th className="px-4 py-3 text-center">Bukti Nota</th>
                          <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {expenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 whitespace-nowrap text-slate-600">{exp.expense_date}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{exp.description}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold uppercase text-slate-700">
                                {exp.tax_type} {exp.tax_amount > 0 && `(Rp ${Number(exp.tax_amount).toLocaleString('id-ID')})`}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                              Rp {Number(exp.gross_amount).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-indigo-700 whitespace-nowrap">
                              Rp {Number(exp.net_amount || exp.gross_amount).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
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
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => deleteExpense(exp.id, projectId)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                title="Hapus Kuitansi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Content: Rencana Anggaran Biaya (RAB) */}
            {budgetTab === 'rab' && (
              <div>
                {budgetItems.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                    <PieChart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">Belum ada item RAB dirancang</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Rinci rencana pengeluaran berdasarkan standar biaya masukan (SBM) untuk memudahkan SPJ.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Kategori SBM</th>
                          <th className="px-4 py-3">Uraian Komponen</th>
                          <th className="px-4 py-3 text-right">Harga Satuan</th>
                          <th className="px-4 py-3 text-center">Volume</th>
                          <th className="px-4 py-3 text-right">Total Anggaran</th>
                          <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {budgetItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                                {item.category.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{item.description}</td>
                            <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">
                              Rp {Number(item.unit_price).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-black text-slate-900 whitespace-nowrap">
                              Rp {Number(item.total_planned || item.unit_price * item.quantity).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => deleteBudgetItem(item.id, projectId)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                title="Hapus Item RAB"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: RESEARCH OUTPUTS */}
        {activeTab === 'outputs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Luaran Riset, Publikasi & HKI</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pelacakan siklus hidup manuskrip jurnal, pendaftaran hak cipta software, dan prototipe sistem.
                </p>
              </div>
              <button
                onClick={() => setShowOutputModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Luaran Riset</span>
              </button>
            </div>

            {outputs.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Belum ada luaran riset terdaftar</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Daftarkan target jurnal ilmiah, konferensi, atau hak cipta program untuk memonitor tahapan review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outputs.map((out) => (
                  <div
                    key={out.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {out.output_type.replace(/_/g, ' ')}
                        </span>
                        <select
                          value={out.status}
                          onChange={(e) => updateResearchOutputStatus(out.id, projectId, e.target.value)}
                          className="text-[11px] font-bold uppercase px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700"
                        >
                          <option value="drafting">Drafting</option>
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="revision">Revision</option>
                          <option value="accepted">Accepted</option>
                          <option value="published">Published</option>
                          <option value="granted">Granted (HKI)</option>
                        </select>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{out.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Target: <span className="font-semibold text-slate-700">{out.target_outlet || '-'}</span>
                      </p>

                      {out.current_deadline && (
                        <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Batas Waktu Revisi: {out.current_deadline}</span>
                        </p>
                      )}

                      {out.doi_or_reg_number && (
                        <p className="text-[11px] text-indigo-600 font-mono mt-1">
                          DOI / No. Reg: {out.doi_or_reg_number}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {out.document_url ? (
                        <a
                          href={out.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <span>Unduh / Buka Dokumen</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">Belum ada file terlampir</span>
                      )}

                      <button
                        onClick={() => deleteResearchOutput(out.id, projectId)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Hapus Luaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
            {/* Box Edit Chat ID Telegram Grup */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-600" />
                    <span>Pengaturan Chat ID Grup Telegram Tim</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Masukkan Chat ID grup (biasanya bernilai negatif diawali -100) tempat bot @SimRisetReminderBot bergabung.
                  </p>
                </div>
                <Link
                  href={`/projects/${projectId}/edit`}
                  className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Edit Semua Data Proyek</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {chatIdMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    chatIdMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {chatIdMessage.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  )}
                  <span>{chatIdMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveChatId} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={chatIdInput}
                  onChange={(e) => setChatIdInput(e.target.value)}
                  placeholder="Contoh: -1002345678901"
                  className="flex-1 px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={chatIdLoading}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {chatIdLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Chat ID</span>
                </button>
              </form>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">💡 Cara Cepat Cek Chat ID Grup:</span>
                <p>
                  1. Masukkan bot <strong>@SimRisetReminderBot</strong> dan <strong>@RawDataBot</strong> ke dalam grup Telegram Anda.<br />
                  2. Bot <code>@RawDataBot</code> akan mengirim pesan JSON; cari baris <code>&quot;id&quot;: -100xxxxxxxxxx</code> di bagian <code>chat</code>.<br />
                  3. Salin angka tersebut lengkap dengan tanda minus (-) lalu tempel di kolom atas dan klik <strong>Simpan Chat ID</strong>.
                </p>
              </div>
            </div>

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
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Aturan Pengingat Otomatis Aktif (Rules Engine)
                </h4>
                <button
                  onClick={() => setShowRuleModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Aturan</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Agenda Target</th>
                      <th className="px-4 py-3">Pemicu Waktu</th>
                      <th className="px-4 py-3">Waktu Eksekusi</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
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
                            : rule.event_type === 'task_deadline'
                            ? 'Batas Waktu Tugas (Task)'
                            : rule.event_type === 'journal_revision'
                            ? 'Batas Revisi Jurnal / Luaran'
                            : rule.event_type}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          H{rule.trigger_offset_days} ({Math.abs(rule.trigger_offset_days)} Hari Sebelum Deadline)
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {rule.dispatch_time} WIB
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleNotificationRule(rule.id, projectId, !rule.is_active)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rule.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rule.is_active ? 'AKTIF' : 'NONAKTIF'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteNotificationRule(rule.id, projectId)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Hapus Aturan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Catat Realisasi Belanja & Kuitansi Cloudinary */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Catat Realisasi Belanja & Unggah Kuitansi</h3>
            <p className="text-xs text-slate-500 mb-4">
              Bukti foto nota/struk akan diunggah dan dikompresi otomatis ke Cloudinary.
            </p>

            {expenseError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-xs text-red-700">
                {expenseError}
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Belanja</label>
                <input
                  name="expenseDate"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori RAB Terkait (Opsional)</label>
                <select
                  name="budgetItemId"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Tanpa Rujukan RAB --</option>
                  {budgetItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.category.replace(/_/g, ' ')}] {item.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Uraian / Deskripsi Belanja</label>
                <input
                  name="description"
                  required
                  placeholder="Contoh: Pembelian SSD NVMe untuk Server Pengujian Model"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Bruto (Rp)</label>
                  <input
                    name="grossAmount"
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    placeholder="1500000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Pajak</label>
                  <select
                    name="taxType"
                    defaultValue="none"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="none">Tanpa Pajak</option>
                    <option value="pph21">PPh 21 (Honor/Narasumber ~5%)</option>
                    <option value="pph23">PPh 23 (Sewa/Jasa ~2%)</option>
                    <option value="ppn">PPN (11%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unggah Bukti Kuitansi / Nota (Foto / PDF) <span className="text-red-500">*</span>
                </label>
                <input
                  name="receiptFile"
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={expenseLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {expenseLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan & Upload Cloudinary</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Item RAB */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Rancang Rencana Anggaran (RAB)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tambahkan pos belanja berdasarkan Standar Biaya Masukan (SBM).
            </p>

            {budgetError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-xs text-red-700">
                {budgetError}
              </div>
            )}

            <form onSubmit={handleCreateBudgetItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Belanja SBM</label>
                <select
                  name="category"
                  defaultValue="bahan_habis_pakai"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white capitalize"
                >
                  <option value="bahan_habis_pakai">Bahan Habis Pakai</option>
                  <option value="sewa_alat">Sewa Peralatan / Server Cloud</option>
                  <option value="perjalanan">Perjalanan Dinas / Survei Lapangan</option>
                  <option value="honorarium">Honorarium Pelaksana / Asisten Riset</option>
                  <option value="luaran_publikasi">Biaya Luaran & Publikasi Scopus/HKI</option>
                  <option value="lainnya">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Uraian Komponen</label>
                <input
                  name="description"
                  required
                  placeholder="Contoh: Langganan Google Cloud Platform GPU 3 Bulan"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Biaya Satuan (Rp)</label>
                  <input
                    name="unitPrice"
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    placeholder="2500000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Volume / Kuantitas</label>
                  <input
                    name="quantity"
                    type="number"
                    required
                    defaultValue={1}
                    min={1}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={budgetLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {budgetLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Item RAB</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Luaran Riset */}
      {showOutputModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Tambah Target Luaran Riset</h3>
            <p className="text-xs text-slate-500 mb-4">
              Daftarkan naskah publikasi, pendaftaran HKI, atau prototipe sistem.
            </p>

            {outputError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-xs text-red-700">
                {outputError}
              </div>
            )}

            <form onSubmit={handleCreateOutput} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Luaran</label>
                <select
                  name="outputType"
                  defaultValue="scopus_journal"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white capitalize"
                >
                  <option value="scopus_journal">Jurnal Internasional Terindeks Scopus</option>
                  <option value="sinta_journal">Jurnal Nasional Terakreditasi SINTA</option>
                  <option value="conference_paper">Prosiding Konferensi Internasional</option>
                  <option value="hki_copyright">Hak Cipta (Source Code / Modul)</option>
                  <option value="patent">Paten / Paten Sederhana</option>
                  <option value="software_prototype">Prototipe Perangkat Lunak</option>
                  <option value="book">Buku Ajar / Monograf</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Luaran / Naskah</label>
                <textarea
                  name="title"
                  required
                  rows={2}
                  placeholder="Judul artikel atau nama ciptaan perangkat lunak"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Outlet / Penyelenggara</label>
                <input
                  name="targetOutlet"
                  placeholder="Contoh: IEEE Access (Q1) / Jurnal SISFO Sinta 2"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Awal</label>
                  <select
                    name="status"
                    defaultValue="drafting"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white capitalize"
                  >
                    <option value="drafting">Drafting</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="revision">Revision Required</option>
                    <option value="accepted">Accepted</option>
                    <option value="published">Published</option>
                    <option value="granted">Granted (HKI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Waktu Revisi</label>
                  <input
                    name="currentDeadline"
                    type="date"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor DOI / Registrasi (Opsional)</label>
                <input
                  name="doiOrRegNumber"
                  placeholder="10.1109/ACCESS.2026.xxx / EC002026xxx"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tautan Dokumen / Sertifikat (Opsional)</label>
                <input
                  name="documentUrl"
                  type="url"
                  placeholder="https://doi.org/... atau https://drive.google.com/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOutputModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={outputLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {outputLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Luaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Aturan Pengingat */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Tambah Aturan Pengingat Telegram</h3>
            <p className="text-xs text-slate-500 mb-4">
              Konfigurasikan jadwal bot mengirim pengingat otomatis ke grup tim.
            </p>

            {ruleError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-xs text-red-700">
                {ruleError}
              </div>
            )}

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agenda yang Diingatkan</label>
                <select
                  name="eventType"
                  defaultValue="interim_report"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="interim_report">Laporan Kemajuan / Monev</option>
                  <option value="final_report">Laporan Akhir Riset</option>
                  <option value="task_deadline">Batas Waktu Tugas (Task/WBS)</option>
                  <option value="journal_revision">Batas Waktu Revisi Jurnal / Luaran</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pemicu Hari (H-minus)</label>
                  <select
                    name="triggerOffsetDays"
                    defaultValue="-7"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="-30">H-30 (1 Bulan Sebelumnya)</option>
                    <option value="-14">H-14 (2 Minggu Sebelumnya)</option>
                    <option value="-7">H-7 (1 Minggu Sebelumnya)</option>
                    <option value="-3">H-3 (3 Hari Sebelumnya)</option>
                    <option value="-1">H-1 (1 Hari Sebelumnya)</option>
                    <option value="0">H-0 (Hari-H)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Kirim</label>
                  <input
                    name="dispatchTime"
                    type="time"
                    defaultValue="08:00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Saluran Pengiriman</label>
                <select
                  name="targetChannel"
                  defaultValue="both"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="both">Grup Proyek & Personal Anggota</option>
                  <option value="group">Hanya Grup Proyek</option>
                  <option value="personal">Hanya Chat Personal</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={ruleLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {ruleLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Pasang Aturan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ANGGOTA TIM */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Tambah Anggota ke Proyek Riset</span>
              </h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {memberError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{memberError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Pengguna Terdaftar *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="contoh: student.demo@simriset.ac.id"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Pengguna harus sudah terdaftar di sistem SIM-Riset.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peran dalam Proyek (Role) *
                </label>
                <select
                  name="role"
                  defaultValue="student_ra"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="co_pi">Co-PI (Dosen Anggota Peneliti)</option>
                  <option value="student_ra">Student RA (Mahasiswa Asisten Peneliti / MBKM)</option>
                  <option value="partner">Partner (PIC Mitra Industri / Eksternal)</option>
                  <option value="auditor">Auditor (Reviewer Internal LPPM / Verifikator SPJ)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={memberLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {memberLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Tambahkan ke Tim</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
