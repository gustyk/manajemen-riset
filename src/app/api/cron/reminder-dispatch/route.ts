import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTelegramMessage } from '@/lib/telegram/bot';

export async function POST(req: NextRequest) {
  // 1. Verifikasi Header Keamanan Bearer Token
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // 2. Ambil seluruh aturan notifikasi aktif
    const { data: rules, error: rulesError } = await supabase
      .from('notification_rules')
      .select('*, projects(*)')
      .eq('is_active', true);

    if (rulesError) {
      return NextResponse.json({ error: rulesError.message }, { status: 500 });
    }

    const logs: any[] = [];
    const today = new Date().toISOString().split('T')[0];

    // 3. Evaluasi setiap aturan pengingat terhadap entitas target
    for (const rule of rules || []) {
      const project = rule.projects;
      if (!project) continue;

      let targetDateStr: string | null = null;
      let eventTitle = '';

      if (rule.event_type === 'interim_report' || rule.event_type === 'final_report') {
        targetDateStr = project.end_date;
        eventTitle = rule.event_type === 'interim_report' ? 'Laporan Kemajuan / Monev' : 'Laporan Akhir Riset';
      }

      if (targetDateStr) {
        const targetDate = new Date(targetDateStr);
        const todayDate = new Date(today);
        const diffDays = Math.ceil((targetDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24));

        // Jika selisih hari cocok dengan trigger_offset_days (contoh: 7 hari sebelum deadline)
        if (diffDays === Math.abs(rule.trigger_offset_days)) {
          const idempotencyKey = `${rule.id}_${project.id}_${today}`;

          // Cek apakah sudah pernah terkirim hari ini
          const { data: existingLog } = await supabase
            .from('notification_logs')
            .select('id')
            .eq('idempotency_key', idempotencyKey)
            .maybeSingle();

          if (!existingLog && project.telegram_group_id) {
            const message = `🔔 *PENGINGAT DEADLINE RISET*\n\n` +
              `*Proyek:* ${project.title}\n` +
              `*Agenda:* ${eventTitle}\n` +
              `*Batas Waktu:* ${targetDateStr} (${diffDays} hari lagi)\n\n` +
              `Harap segera melengkapi dokumen dan mengunggahnya ke sistem.`;

            const buttons = [
              [{ text: '🔗 Buka Dasbor Proyek', url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${project.id}` }]
            ];

            const sendResult = await sendTelegramMessage(project.telegram_group_id, message, buttons);

            await supabase.from('notification_logs').insert({
              rule_id: rule.id,
              project_id: project.id,
              recipient_chat_id: project.telegram_group_id,
              message_content: message,
              is_successful: sendResult.success,
              idempotency_key: idempotencyKey,
            });

            logs.push({ projectId: project.id, event: eventTitle, success: sendResult.success });
          }
        }
      }
    }

    return NextResponse.json({ message: 'Evaluasi pengingat selesai', dispatched: logs.length, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
