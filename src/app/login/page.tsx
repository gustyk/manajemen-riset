'use client';

import { useState } from 'react';
import Image from 'next/image';
import { login, signup } from '@/app/auth/actions';
import {
  FolderKanban,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Send,
} from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = isRegister ? await signup(formData) : await login(formData);
      if (res?.error) {
        setErrorMessage(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      setErrorMessage(err.message || 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  }

  const demoAccounts = [
    { role: 'Ketua Peneliti (PI)', email: 'pi.demo@simriset.ac.id', name: 'Prof. Dr. Ir. Wahyu Hidayat' },
    { role: 'Mahasiswa (RA)', email: 'student.demo@simriset.ac.id', name: 'Bagas Pratama Putra' },
    { role: 'Auditor LPPM', email: 'auditor.demo@simriset.ac.id', name: 'Dra. Sri Wahyuni, M.Ak.' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row font-sans selection:bg-orange-600 selection:text-white">
      {/* Left Column: Hero & Architectural Graphic */}
      <div className="lg:w-1/2 bg-zinc-950 text-white p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-base text-white">
                  SIM-RISET
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block -mt-0.5">
                Platform Riset Kolaboratif & MBKM
              </span>
            </div>
          </div>

          {/* Hero Typography */}
          <div className="mt-10 lg:mt-14 max-w-lg">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-orange-400 font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              VERSI 2026 • ZERO OPERATIONAL COST
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Tata Kelola Riset Akademik Terpadu & Siap Audit.
            </h1>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Monitoring milestone WBS, logbook ekuivalensi konversi MBKM, pertanggungjawaban belanja SPJ berbasis SBM, dan otomasi notifikasi Telegram.
            </p>
          </div>

          {/* Graphic Showcase */}
          <div className="mt-8 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50 shadow-2xl relative">
            <div className="h-5 bg-zinc-900/90 border-b border-zinc-800 px-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
              <span className="text-[9px] font-mono text-zinc-500 ml-2">architecture-blueprint.svg</span>
            </div>
            <div className="relative aspect-video w-full">
              <Image
                src="/images/research-hero.jpg"
                alt="Research Management Architecture"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Demo Credentials Quick-Card */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
            Akun Demo Pengujian Cepat (Password: <span className="font-mono text-orange-400">DemoPassword2026!</span>)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {demoAccounts.map((acc, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px]">
                <span className="font-bold text-orange-400 block truncate">{acc.role}</span>
                <span className="font-mono text-zinc-300 text-[10px] block truncate">{acc.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: High-Precision Form Panel */}
      <div className="lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="max-w-md w-full">
          {/* Switcher Tab */}
          <div className="flex rounded-lg bg-zinc-100 p-1 mb-8 border border-zinc-200">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMessage(null);
              }}
              className={`w-1/2 py-2 text-xs font-bold rounded-md transition-all ${
                !isRegister
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Masuk Sistem
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMessage(null);
              }}
              className={`w-1/2 py-2 text-xs font-bold rounded-md transition-all ${
                isRegister
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
              {isRegister ? 'Pendaftaran Peneliti & Mahasiswa' : 'Otentikasi Pengguna'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {isRegister
                ? 'Lengkapi identitas akademik untuk memulai kolaborasi riset.'
                : 'Gunakan kredensial kampus Anda yang telah terdaftar.'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <span className="font-bold shrink-0">Kesalahan:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Nama Lengkap Beserta Gelar
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      name="fullName"
                      type="text"
                      required
                      placeholder="Contoh: Dr. Ir. Fulan, M.Kom / Bagas (Mahasiswa)"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    NIDN (Dosen) / NIM (Mahasiswa)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      name="nidnNim"
                      type="text"
                      placeholder="0012345678 / 20210801001"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Alamat Email Resmi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="nama@universitas.ac.id"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-zinc-950 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Selesaikan Registrasi' : 'Masuk ke Dashboard'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Send className="w-3 h-3 text-orange-600" />
              <span>Telegram Bot: <span className="font-mono font-semibold text-zinc-800">@SimRisetReminderBot</span></span>
            </span>
            <span className="font-mono text-[10px] text-zinc-400">TA 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
