import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTelegramMessage } from '@/lib/telegram/bot';

export async function POST(req: NextRequest) {
  // 1. Validasi Webhook Secret Token jika disetel di Telegram Webhook
  const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
  const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (expectedToken && secretToken !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized secret token' }, { status: 401 });
  }

  try {
    const update = await req.json();
    const message = update.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const supabase = createAdminClient();

    // Command: /start <pairing_token>
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1) {
        const pairingToken = parts[1];

        // Cari profil dengan token tersebut
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('telegram_auth_token', pairingToken)
          .maybeSingle();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              telegram_chat_id: chatId,
              telegram_username: message.from?.username || null,
              telegram_auth_token: null, // Reset setelah berhasil dipasangkan
            })
            .eq('id', profile.id);

          await sendTelegramMessage(
            chatId,
            `✅ *Akun Berhasil Terhubung!*\n\nHalo *${profile.full_name}*, akun Telegram Anda telah berhasil terhubung dengan Sistem Informasi Manajemen Riset.`
          );
          return NextResponse.json({ ok: true });
        }
      }

      await sendTelegramMessage(
        chatId,
        `👋 *Selamat datang di Bot SIM-Riset!*\n\nUntuk menghubungkan akun Anda, silakan buka menu profil di aplikasi web dan klik tombol *Hubungkan ke Telegram*.`
      );
      return NextResponse.json({ ok: true });
    }

    // Command: /help
    if (text === '/help') {
      await sendTelegramMessage(
        chatId,
        `📖 *Bantuan Bot SIM-Riset*\n\n` +
        `• \`/start\` : Menghubungkan akun\n` +
        `• \`/status\` : Menampilkan status ringkasan proyek riset\n` +
        `• \`/mytasks\` : Menampilkan tugas yang ditugaskan kepada Anda`
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
