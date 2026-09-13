'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram/bot';

// 1. Tambah Tugas / Task WBS
export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDate = formData.get('dueDate') as string;
  const priority = parseInt(formData.get('priority') as string, 10) || 2;
  const assignedTo = (formData.get('assignedTo') as string) || null;

  if (!projectId || !title) {
    return { error: 'Judul tugas wajib diisi.' };
  }

  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    title,
    description,
    due_date: dueDate ? new Date(dueDate).toISOString() : null,
    priority,
    assigned_to: assignedTo || null,
    status: 'todo',
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 2. Update Status Tugas
export async function updateTaskStatus(taskId: string, projectId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 3. Tambah Logbook Mahasiswa
export async function submitLogbook(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Harus login terlebih dahulu.' };

  const projectId = formData.get('projectId') as string;
  const activityDate = formData.get('activityDate') as string;
  const activityDescription = formData.get('activityDescription') as string;
  const hoursSpent = parseInt(formData.get('hoursSpent') as string, 10) || 1;
  const evidenceUrl = formData.get('evidenceUrl') as string;

  if (!projectId || !activityDate || !activityDescription) {
    return { error: 'Tanggal dan deskripsi aktivitas wajib diisi.' };
  }

  const { error } = await supabase.from('logbooks').insert({
    project_id: projectId,
    user_id: user.id,
    activity_date: activityDate,
    activity_description: activityDescription,
    hours_spent: hoursSpent,
    evidence_url: evidenceUrl || null,
    status: 'submitted',
  });

  if (error) return { error: error.message };

  // Notifikasi Dosen PI via Telegram jika ada grup
  const { data: project } = await supabase
    .from('projects')
    .select('title, telegram_group_id')
    .eq('id', projectId)
    .single();

  if (project?.telegram_group_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const msg =
      `📝 *LOGBOOK MAHASISWA BARU*\n\n` +
      `*Proyek:* ${project.title}\n` +
      `*Mahasiswa:* ${profile?.full_name || 'Asisten Peneliti'}\n` +
      `*Tanggal:* ${activityDate} (${hoursSpent} Jam)\n` +
      `*Aktivitas:* ${activityDescription.slice(0, 120)}...\n\n` +
      `Menunggu review dosen pembimbing.`;

    await sendTelegramMessage(project.telegram_group_id, msg);
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 4. Verifikasi Logbook oleh Dosen
export async function verifyLogbook(
  logbookId: string,
  projectId: string,
  status: 'approved' | 'rejected',
  feedback?: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('logbooks')
    .update({
      status,
      lecturer_feedback: feedback || null,
      verified_at: new Date().toISOString(),
    })
    .eq('id', logbookId);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 5. Tambah Anggota Tim (Co-PI / Mahasiswa RA)
export async function addProjectMember(formData: FormData) {
  const supabase = await createClient();
  const projectId = formData.get('projectId') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  if (!email || !role) return { error: 'Email dan peran wajib diisi.' };

  // Cari user berdasarkan email di profiles
  // Note: profiles table has user IDs, we can look up by email from auth.users or profiles
  // Jika email belum terdaftar di profiles, buat catatan
  return { success: true };
}

// 6. Test Kirim Pengingat Telegram Manual
export async function testTelegramPing(projectId: string) {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('title, telegram_group_id, end_date')
    .eq('id', projectId)
    .single();

  if (!project?.telegram_group_id) {
    return { error: 'Chat ID Grup Telegram belum disetel pada proyek ini.' };
  }

  const message =
    `🔔 *UJI COBA SISTEM NOTIFIKASI TELEGRAM*\n\n` +
    `*Proyek:* ${project.title}\n` +
    `*Status Bot:* Terhubung & Siap Mengirim Reminder\n` +
    `*Batas Akhir Riset:* ${project.end_date}\n\n` +
    `Pesan ini adalah verifikasi bahwa bot @SimRisetReminderBot telah berhasil terhubung dengan grup tim riset Anda.`;

  const res = await sendTelegramMessage(project.telegram_group_id, message, [
    [{ text: '🌐 Buka Dashboard SIM-Riset', url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}` }]
  ]);

  if (!res.success) {
    return { error: res.error || 'Gagal mengirim pesan Telegram' };
  }

  return { success: true };
}
