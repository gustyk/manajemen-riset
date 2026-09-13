'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Anda harus login untuk membuat proyek riset.' };
  }

  const title = formData.get('title') as string;
  const focusArea = formData.get('focusArea') as string;
  const scheme = formData.get('scheme') as string;
  const fiscalYear = parseInt(formData.get('fiscalYear') as string, 10) || new Date().getFullYear();
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const totalBudget = parseFloat(formData.get('totalBudget') as string) || 0;
  const telegramGroupIdRaw = formData.get('telegramGroupId') as string;
  const telegramGroupId = telegramGroupIdRaw ? parseInt(telegramGroupIdRaw.trim(), 10) : null;

  if (!title || !scheme || !startDate || !endDate) {
    return { error: 'Judul riset, skema, dan tanggal mulai/selesai wajib diisi.' };
  }

  // 1. Simpan Proyek
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      title,
      focus_area: focusArea || 'Sistem Informasi',
      scheme,
      fiscal_year: fiscalYear,
      start_date: startDate,
      end_date: endDate,
      total_budget: totalBudget,
      telegram_group_id: telegramGroupId,
      created_by: user.id,
      status: 'draft',
    })
    .select()
    .single();

  if (projectError) {
    return { error: projectError.message };
  }

  // 2. Tambahkan Ketua Peneliti (PI) ke tabel project_members
  await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: user.id,
    role: 'pi',
  });

  // 3. Buat Aturan Default Pengingat Telegram (H-14, H-7, H-3, H-1)
  const defaultRules = [
    { event_type: 'interim_report', trigger_offset_days: -14 },
    { event_type: 'interim_report', trigger_offset_days: -7 },
    { event_type: 'final_report', trigger_offset_days: -7 },
    { event_type: 'final_report', trigger_offset_days: -1 },
  ];

  const ruleInserts = defaultRules.map((r) => ({
    project_id: project.id,
    event_type: r.event_type,
    trigger_offset_days: r.trigger_offset_days,
    dispatch_time: '08:00:00',
    target_channel: 'both',
    is_active: true,
  }));

  await supabase.from('notification_rules').insert(ruleInserts);

  revalidatePath('/projects');
  redirect(`/projects/${project.id}`);
}
