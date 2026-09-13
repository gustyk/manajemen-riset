import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  RefreshCw,
  Bell,
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

  async function generateNewToken() {
    'use server';
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return;

    const newToken = Math.random().toString(36).substring(2, 10);
    await client
      .from('profiles')
      .update({ telegram_auth_token: newToken })
      .eq('id', user.id);

    revalidatePath('/settings');
  }

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
      <div className="max-w-3xl">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pengaturan & Integrasi Telegram Bot
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Hubungkan akun SIM-Riset Anda dengan bot resmi untuk menerima notifikasi pengingat secara personal.
          </p>
        </div>

        <div className="space-y-6">
          {/* Card Status Koneksi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bot Telegram: @{botUsername}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isConnected
                      ? 'Akun Anda telah terhubung dan aktif menerima peringatan.'
                      : 'Akun Anda belum terhubung. Ikuti langkah di bawah untuk menghubungkan.'}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isConnected ? 'Terhubung' : 'Belum Terhubung'}
              </span>
            </div>

            {isConnected ? (
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-600">
                    ID Chat Telegram:{' '}
                    <span className="font-mono font-bold text-slate-900">
                      {profile.telegram_chat_id}
                    </span>
                  </p>
                  {profile.telegram_username && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      Username: <span className="font-bold text-slate-900">@{profile.telegram_username}</span>
                    </p>
                  )}
                </div>

                <form action={disconnectTelegram}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                  >
                    Putuskan Hubungan
                  </button>
                </form>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                <p className="text-xs text-slate-700 font-semibold">
                  Cara Menyambungkan Akun ke Telegram:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="font-bold text-slate-900 block">Cara 1 (Otomatis):</span>
                    <p className="text-slate-600">
                      Klik tombol di bawah ini untuk membuka aplikasi Telegram dan tekan <strong>Start</strong>.
                    </p>
                    <a
                      href={deepLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Buka Telegram Bot</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="font-bold text-slate-900 block">Cara 2 (Manual):</span>
                    <p className="text-slate-600">
                      Buka bot <strong>@{botUsername}</strong> di Telegram, lalu kirimkan perintah:
                    </p>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono font-bold text-indigo-600">
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
