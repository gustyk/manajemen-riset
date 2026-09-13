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
        const pairingToken = parts[1].trim();

        // Cari profil dengan token tersebut
        const { data: profile } = await supabase
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
            `✅ *Akun Berhasil Terhubung!*\n\nHalo *${profile.full_name}*, akun Telegram Anda telah berhasil disinkronkan dengan Sistem Informasi Manajemen Riset.`
          );
          return NextResponse.json({ ok: true });
        }
      }

      await sendTelegramMessage(
        chatId,
        `👋 *Selamat datang di Bot SIM-Riset!*\n\n` +
        `Untuk menghubungkan akun Anda, buka menu *Notifikasi Telegram* di aplikasi web dan klik link tautkan akun.`
      );
      return NextResponse.json({ ok: true });
    }

    // Command: /status (Ringkasan Proyek)
    if (text === '/status') {
      // Cari apakah chat ini adalah personal user atau grup proyek
      const { data: groupProject } = await supabase
        .from('projects')
        .select('*')
        .eq('telegram_group_id', chatId)
        .maybeSingle();

      if (groupProject) {
        const { count: taskCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', groupProject.id)
          .neq('status', 'done');

        const { count: logbookCount } = await supabase
          .from('logbooks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', groupProject.id)
          .eq('status', 'submitted');

        const msg =
          `📊 *STATUS PROYEK RISET*\n\n` +
          `*Judul:* ${groupProject.title}\n` +
          `*Skema:* ${groupProject.scheme.toUpperCase()}\n` +
          `*Batas Waktu:* ${groupProject.end_date}\n` +
          `*Total Pagu:* Rp ${Number(groupProject.total_budget).toLocaleString('id-ID')}\n\n` +
          `📌 *Aktivitas Berjalan:*\n` +
          `• Tugas aktif: ${taskCount || 0} task\n` +
          `• Logbook menunggu review: ${logbookCount || 0} entri`;

        await sendTelegramMessage(chatId, msg);
        return NextResponse.json({ ok: true });
      }

      // Jika chat personal
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('telegram_chat_id', chatId)
        .maybeSingle();

      if (!profile) {
        await sendTelegramMessage(chatId, '⚠️ Akun Anda belum terhubung ke sistem web. Gunakan `/start <token>` terlebih dahulu.');
        return NextResponse.json({ ok: true });
      }

      const { data: projects } = await supabase
        .from('projects')
        .select('id, title, end_date, total_budget, status')
        .eq('created_by', profile.id)
        .limit(5);

      if (!projects || projects.length === 0) {
        await sendTelegramMessage(chatId, `Halo *${profile.full_name}*, Anda belum memiliki proyek riset aktif.`);
        return NextResponse.json({ ok: true });
      }

      let msg = `📊 *PROYEK RISET ANDA (${profile.full_name})*\n\n`;
      projects.forEach((p, idx) => {
        msg += `${idx + 1}. *${p.title.slice(0, 45)}...*\n   Deadline: ${p.end_date} | Status: ${p.status}\n\n`;
      });

      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // Command: /mytasks
    if (text === '/mytasks') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('telegram_chat_id', chatId)
        .maybeSingle();

      if (!profile) {
        await sendTelegramMessage(chatId, '⚠️ Hubungkan akun Anda terlebih dahulu via `/start <token>`.');
        return NextResponse.json({ ok: true });
      }

      const { data: myTasks } = await supabase
        .from('tasks')
        .select('title, due_date, status, projects(title)')
        .eq('assigned_to', profile.id)
        .neq('status', 'done')
        .limit(8);

      if (!myTasks || myTasks.length === 0) {
        await sendTelegramMessage(chatId, '🎉 Tidak ada tugas tertunda yang didelegasikan kepada Anda saat ini.');
        return NextResponse.json({ ok: true });
      }

      let msg = `📝 *DAFTAR TUGAS ANDA (${profile.full_name})*\n\n`;
      myTasks.forEach((t: any, i) => {
        msg += `${i + 1}. *${t.title}*\n   Proyek: ${t.projects?.title?.slice(0, 35)}...\n   Deadline: ${t.due_date ? t.due_date.split('T')[0] : 'Tidak disetel'}\n\n`;
      });

      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // Command: /pending_logbook
    if (text === '/pending_logbook') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('telegram_chat_id', chatId)
        .maybeSingle();

      if (!profile) {
        await sendTelegramMessage(chatId, '⚠️ Hubungkan akun Anda terlebih dahulu via `/start <token>`.');
        return NextResponse.json({ ok: true });
      }

      const { data: pendingLogs } = await supabase
        .from('logbooks')
        .select('id, activity_date, hours_spent, projects(title), student_profile:user_id(full_name)')
        .eq('status', 'submitted')
        .limit(5);

      if (!pendingLogs || pendingLogs.length === 0) {
        await sendTelegramMessage(chatId, '✅ Semua logbook mahasiswa telah diverifikasi.');
        return NextResponse.json({ ok: true });
      }

      let msg = `📚 *LOGBOOK MENUNGGU REVIEW DOSEN*\n\n`;
      pendingLogs.forEach((l: any, i) => {
        msg += `${i + 1}. *${l.student_profile?.full_name}* (${l.activity_date} - ${l.hours_spent} Jam)\n   Proyek: ${l.projects?.title?.slice(0, 35)}...\n\n`;
      });

      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // Command: /help
    if (text === '/help') {
      await sendTelegramMessage(
        chatId,
        `📖 *BANTUAN PERINTAH BOT SIM-RISET*\n\n` +
        `• \`/status\` : Ringkasan status dan aktivitas proyek riset\n` +
        `• \`/mytasks\` : Daftar tugas yang ditugaskan kepada Anda\n` +
        `• \`/pending_logbook\` : Daftar logbook mahasiswa yang belum diverifikasi\n` +
        `• \`/start <token>\` : Menghubungkan akun personal Telegram Anda\n` +
        `• \`/help\` : Menampilkan pesan bantuan ini`
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
