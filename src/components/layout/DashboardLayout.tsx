import Link from 'next/link';
import { logout } from '@/app/auth/actions';
import {
  FolderKanban,
  Users,
  BookOpenCheck,
  Receipt,
  FileCheck2,
  BellRing,
  LogOut,
  Send,
  Sparkles,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    id: string;
    email?: string;
    fullName?: string;
    role?: string;
    telegramChatId?: number | null;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const isTelegramConnected = !!user.telegramChatId;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base block">
                SIM-Riset
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block -mt-0.5">
                Sistem Informasi
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <Link
              href="/projects"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all"
            >
              <FolderKanban className="w-4 h-4 text-slate-500" />
              <span>Proyek Riset</span>
            </Link>

            <Link
              href="/partners"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Mitra Riset</span>
            </Link>

            <Link
              href="/logbooks"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all"
            >
              <BookOpenCheck className="w-4 h-4 text-slate-500" />
              <span>Logbook Mahasiswa</span>
            </Link>

            <Link
              href="/expenses"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all"
            >
              <Receipt className="w-4 h-4 text-slate-500" />
              <span>SPJ & Realisasi Dana</span>
            </Link>

            <Link
              href="/outputs"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-slate-500" />
              <span>Publikasi & HKI</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all"
            >
              <BellRing className="w-4 h-4 text-slate-500" />
              <span>Notifikasi Telegram</span>
            </Link>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Telegram Connection Pill */}
          <Link
            href="/settings"
            className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors border ${
              isTelegramConnected
                ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800'
                : 'bg-amber-50/80 border-amber-200/80 text-amber-800 hover:bg-amber-100/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5" />
              <span className="font-semibold">
                {isTelegramConnected ? 'Telegram Aktif' : 'Sambungkan Bot'}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white font-medium shadow-xs">
              {isTelegramConnected ? 'Tersinkron' : 'Klik Disini'}
            </span>
          </Link>

          {/* User Profile Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user.fullName || 'Pengguna Riset'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                title="Keluar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md bg-white/90">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Sistem Manajemen Riset Dosen
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-3 py-1.5 rounded-full border border-slate-200">
              Tahun Anggaran 2026
            </span>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
