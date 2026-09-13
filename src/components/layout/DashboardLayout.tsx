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
  Layers,
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
  const initials = (user.fullName || user.email || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans antialiased text-zinc-900 selection:bg-orange-600 selection:text-white">
      {/* Sidebar: Deep Obsidian Black */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white tracking-tight text-sm">
                  SIM-RISET
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block -mt-0.5 truncate">
                Riset & MBKM Kampus
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="p-3">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Menu Utama
            </p>
            <nav className="space-y-1">
              <Link
                href="/projects"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <FolderKanban className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 shrink-0" />
                <span>Proyek Riset</span>
              </Link>

              <Link
                href="/partners"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Mitra Riset</span>
              </Link>

              <Link
                href="/logbooks"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <BookOpenCheck className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Logbook Mahasiswa</span>
              </Link>

              <Link
                href="/expenses"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <Receipt className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>SPJ & Realisasi Dana</span>
              </Link>

              <Link
                href="/outputs"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Publikasi & HKI</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <BellRing className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Notifikasi Telegram</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-zinc-800/80 space-y-2.5">
          {/* Telegram Connection Pill */}
          <Link
            href="/settings"
            className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors border ${
              isTelegramConnected
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                : 'bg-orange-950/30 border-orange-900/50 text-orange-300 hover:bg-orange-950/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className={`w-3.5 h-3.5 ${isTelegramConnected ? 'text-emerald-400' : 'text-orange-400'}`} />
              <span className="font-semibold text-[11px]">
                {isTelegramConnected ? 'Telegram Aktif' : 'Sambung Bot'}
              </span>
            </div>
            <span
              className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${
                isTelegramConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
              }`}
            >
              {isTelegramConnected ? 'ONLINE' : 'LINK'}
            </span>
          </Link>

          {/* User Profile Info */}
          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-mono font-bold text-zinc-200 shrink-0">
                {initials || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-zinc-200 truncate leading-tight">
                  {user.fullName || 'Pengguna Riset'}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 truncate leading-tight">
                  {user.email}
                </p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                title="Keluar"
                className="p-1.5 rounded-md text-zinc-400 hover:text-orange-400 hover:bg-zinc-900 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-zinc-200/90 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight">
              Sistem Manajemen Riset Dosen Sistem Informasi
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-semibold bg-zinc-100 text-zinc-800 px-3 py-1 rounded-md border border-zinc-200">
              TA 2026
            </span>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
