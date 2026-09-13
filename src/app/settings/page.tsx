import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Send,
  ExternalLink,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Ambil profil
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Jika belum punya pairing token dan belum connect, generate token
  if (!profile?.telegram_chat_id && !profile?.telegram_auth_token) {
    const newToken = Math.random().toString(36).substring(2, 10);
    await supabase
      .from('profiles')
      .update({ telegram_auth_token: newToken })
      .eq('id', user.id);

    const { data: updated } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = updated;
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'SimRisetReminderBot';
  const pairingToken = profile?.telegram_auth_token;
  const isConnected = !!profile?.telegram_chat_id;
  const deepLinkUrl = `https://t.me/${botUsername}?start=${pairingToken}`;

  async function disconnectTelegram() {
    'use server';
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return;

    await client
      .from('profiles')
      .update({
        telegram_chat_id: null,
        telegram_username: null,
      })
      .eq('id', user.id);

    revalidatePath('/settings');
  }

  return (
    <DashboardLayout
      user={{
        id: user.id,
        email: user.email,
        fullName: profile?.full_name,
        telegramChatId: profile?.telegram_chat_id,
      }}
    >
      <div className="max-w-3xl font-sans">
        <div className="border-b border-zinc-200 pb-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-600"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Otomasi Mesin Pengingat
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
            Integrasi Bot Telegram Personal
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Hubungkan akun SIM-Riset Anda dengan bot resmi untuk menerima notifikasi pengingat batas waktu dan konfirmasi tugas secara otomatis.
          </p>
        </div>

        <div className="space-y-4">
          {/* Card Status Koneksi */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-950 text-orange-500 flex items-center justify-center border border-zinc-800 shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">
                    Bot Telegram: <span className="font-mono text-orange-600">@{botUsername}</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {isConnected
                      ? 'Akun Anda telah terhubung dan aktif menerima peringatan otomatis.'
                      : 'Akun Anda belum terhubung. Ikuti langkah sinkronisasi berikut.'}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded border ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-orange-50 text-orange-800 border-orange-200'
                }`}
              >
                {isConnected ? 'TERHUBUNG' : 'BELUM AKTIF'}
              </span>
            </div>

            {isConnected ? (
              <div className="mt-5 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-600">
                    ID Chat Telegram:{' '}
                    <span className="font-mono font-bold text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      {profile.telegram_chat_id}
                    </span>
                  </p>
                  {profile.telegram_username && (
                    <p className="text-xs text-zinc-600 mt-1">
                      Username: <strong className="font-mono text-zinc-900">@{profile.telegram_username}</strong>
                    </p>
                  )}
                </div>

                <form action={disconnectTelegram}>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  >
                    Putuskan Hubungan
                  </button>
                </form>
              </div>
            ) : (
              <div className="mt-5 pt-5 border-t border-zinc-100 space-y-4">
                <p className="text-xs text-zinc-800 font-bold">
                  Pilih Salah Satu Metode Aktivasi:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-zinc-950 block text-[11px] uppercase tracking-wider">
                        Opsi 1 (Tautan Otomatis):
                      </span>
                      <p className="text-zinc-600 text-[11px] mt-1 leading-relaxed">
                        Buka aplikasi Telegram dan tekan tombol <strong>Start</strong> untuk sinkronisasi instan.
                      </p>
                    </div>
                    <a
                      href={deepLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors text-xs shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Buka Telegram Bot</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2.5">
                    <span className="font-bold text-zinc-950 block text-[11px] uppercase tracking-wider">
                      Opsi 2 (Perintah Manual):
                    </span>
                    <p className="text-zinc-600 text-[11px] leading-relaxed">
                      Kirimkan perintah verifikasi berikut langsung ke <span className="font-mono text-zinc-900 font-semibold">@{botUsername}</span>:
                    </p>
                    <div className="p-2.5 bg-white rounded-lg border border-zinc-300 font-mono font-bold text-xs text-orange-600 select-all">
                      /start {pairingToken}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
