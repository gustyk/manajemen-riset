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
    const todayDate = new Date(today);

    // 3. Evaluasi setiap aturan pengingat
    for (const rule of rules || []) {
      const project = rule.projects;
      if (!project || !project.telegram_group_id) continue;

      const offsetDays = Math.abs(rule.trigger_offset_days);

      // Event A: Laporan Kemajuan & Akhir
      if (rule.event_type === 'interim_report' || rule.event_type === 'final_report') {
        const targetDateStr = project.end_date;
        if (targetDateStr) {
          const targetDate = new Date(targetDateStr);
          const diffDays = Math.ceil((targetDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24));

          if (diffDays === offsetDays) {
            const idempotencyKey = `${rule.id}_${project.id}_${today}`;
            const { data: existingLog } = await supabase
              .from('notification_logs')
              .select('id')
              .eq('idempotency_key', idempotencyKey)
              .maybeSingle();

            if (!existingLog) {
              const eventTitle =
                rule.event_type === 'interim_report' ? 'Laporan Kemajuan / Monev' : 'Laporan Akhir Riset';

              const message =
                `🔔 *PENGINGAT DEADLINE RISET*\n\n` +
                `*Proyek:* ${project.title}\n` +
                `*Agenda:* ${eventTitle}\n` +
                `*Batas Waktu:* ${targetDateStr} (${diffDays} hari lagi)\n\n` +
                `Harap segera melengkapi dokumen dan mengunggahnya ke sistem.`;

              const buttons = [
                [{ text: '🔗 Buka Dasbor Proyek', url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${project.id}` }],
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

              logs.push({ type: 'project_deadline', projectId: project.id, success: sendResult.success });
            }
          }
        }
      }

      // Event B: Batas Waktu Tugas / Milestone (Task Deadline)
      if (rule.event_type === 'task_deadline') {
        const { data: upcomingTasks } = await supabase
          .from('tasks')
          .select('id, title, due_date, status, assigned_profile:assigned_to(full_name)')
          .eq('project_id', project.id)
          .neq('status', 'done')
          .not('due_date', 'is', null);

        for (const task of upcomingTasks || []) {
          const taskDate = new Date(task.due_date.split('T')[0]);
          const diffDays = Math.ceil((taskDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24));

          if (diffDays === offsetDays) {
            const idempotencyKey = `task_${task.id}_${today}`;
            const { data: existingLog } = await supabase
              .from('notification_logs')
              .select('id')
              .eq('idempotency_key', idempotencyKey)
              .maybeSingle();

            if (!existingLog) {
              const picName = Array.isArray(task.assigned_profile)
                ? (task.assigned_profile[0] as any)?.full_name
                : (task.assigned_profile as any)?.full_name || 'Tim';

              const message =
                `⏰ *PENGINGAT TUGAS RISET*\n\n` +
                `*Proyek:* ${project.title}\n` +
                `*Tugas:* ${task.title}\n` +
                `*PIC:* ${picName}\n` +
                `*Jatuh Tempo:* ${task.due_date.split('T')[0]} (${diffDays} hari lagi)`;

              const sendResult = await sendTelegramMessage(project.telegram_group_id, message);

              await supabase.from('notification_logs').insert({
                rule_id: rule.id,
                project_id: project.id,
                recipient_chat_id: project.telegram_group_id,
                message_content: message,
                is_successful: sendResult.success,
                idempotency_key: idempotencyKey,
              });

              logs.push({ type: 'task_deadline', taskId: task.id, success: sendResult.success });
            }
          }
        }
      }

      // Event C: Batas Waktu Revisi Jurnal / Luaran Riset
      if (rule.event_type === 'journal_revision') {
        const { data: outputs } = await supabase
          .from('research_outputs')
          .select('id, title, target_outlet, current_deadline')
          .eq('project_id', project.id)
          .not('current_deadline', 'is', null);

        for (const out of outputs || []) {
          const deadlineDate = new Date(out.current_deadline);
          const diffDays = Math.ceil((deadlineDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24));

          if (diffDays === offsetDays) {
            const idempotencyKey = `output_${out.id}_${today}`;
            const { data: existingLog } = await supabase
              .from('notification_logs')
              .select('id')
              .eq('idempotency_key', idempotencyKey)
              .maybeSingle();

            if (!existingLog) {
              const message =
                `📄 *PENGINGAT REVISI PUBLIKASI / HKI*\n\n` +
                `*Proyek:* ${project.title}\n` +
                `*Naskah:* ${out.title}\n` +
                `*Target:* ${out.target_outlet || 'Jurnal / Konferensi'}\n` +
                `*Batas Waktu:* ${out.current_deadline} (${diffDays} hari lagi)`;

              const sendResult = await sendTelegramMessage(project.telegram_group_id, message);

              await supabase.from('notification_logs').insert({
                rule_id: rule.id,
                project_id: project.id,
                recipient_chat_id: project.telegram_group_id,
                message_content: message,
                is_successful: sendResult.success,
                idempotency_key: idempotencyKey,
              });

              logs.push({ type: 'journal_revision', outputId: out.id, success: sendResult.success });
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Evaluasi pengingat harian berhasil dieksekusi',
      dispatched: logs.length,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
