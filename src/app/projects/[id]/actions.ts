'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

// 5. Tambah Anggota Tim (Co-PI / Mahasiswa RA / Partner / Auditor)
export async function addProjectMember(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Harus login terlebih dahulu.' };

  const projectId = formData.get('projectId') as string;
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const role = formData.get('role') as string;

  if (!email || !role) return { error: 'Email dan peran wajib diisi.' };

  const admin = createAdminClient();

  // Cari user berdasarkan email dari Auth
  const { data: userList } = await admin.auth.admin.listUsers();
  const targetUser = userList?.users?.find((u) => u.email?.toLowerCase() === email);

  if (!targetUser) {
    return {
      error: `Pengguna dengan email "${email}" belum terdaftar. Pastikan akun telah dibuat.`,
    };
  }

  // Masukkan atau update ke project_members
  const { error: insertError } = await admin
    .from('project_members')
    .upsert(
      {
        project_id: projectId,
        user_id: targetUser.id,
        role: role as any,
      },
      { onConflict: 'project_id,user_id' }
    );

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 5b. Hapus Anggota Tim
export async function removeProjectMember(memberId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Harus login terlebih dahulu.' };

  const admin = createAdminClient();
  const { error } = await admin.from('project_members').delete().eq('id', memberId);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
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

// 7. Tambah Item Rencana Anggaran (RAB)
export async function createBudgetItem(formData: FormData) {
  const supabase = await createClient();
  const projectId = formData.get('projectId') as string;
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const unitPrice = parseFloat(formData.get('unitPrice') as string) || 0;
  const quantity = parseInt(formData.get('quantity') as string, 10) || 1;

  if (!projectId || !category || !description || unitPrice <= 0) {
    return { error: 'Kategori, uraian, dan harga satuan wajib diisi.' };
  }

  const { error } = await supabase.from('budget_items').insert({
    project_id: projectId,
    category,
    description,
    unit_price: unitPrice,
    quantity,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 8. Hapus Item RAB
export async function deleteBudgetItem(itemId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('budget_items').delete().eq('id', itemId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 9. Catat Realisasi Belanja & Upload Kuitansi ke Cloudinary
export async function createExpense(formData: FormData) {
  const { uploadToCloudinary } = await import('@/lib/cloudinary/upload');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Harus login terlebih dahulu.' };

  const projectId = formData.get('projectId') as string;
  const budgetItemId = (formData.get('budgetItemId') as string) || null;
  const expenseDate = formData.get('expenseDate') as string;
  const description = formData.get('description') as string;
  const grossAmount = parseFloat(formData.get('grossAmount') as string) || 0;
  const taxType = (formData.get('taxType') as string) || 'none';
  const customTaxAmountRaw = formData.get('taxAmount') as string;
  const receiptFile = formData.get('receiptFile') as File | null;

  if (!projectId || !expenseDate || !description || grossAmount <= 0) {
    return { error: 'Tanggal, uraian belanja, dan nominal bruto wajib diisi.' };
  }

  if (!receiptFile || receiptFile.size === 0) {
    return { error: 'Bukti foto kuitansi/nota wajib diunggah.' };
  }

  // Hitung estimasi pajak otomatis jika tidak dispesifikasikan manual
  let calculatedTax = 0;
  if (customTaxAmountRaw && customTaxAmountRaw.trim() !== '') {
    calculatedTax = parseFloat(customTaxAmountRaw) || 0;
  } else {
    if (taxType === 'pph21') {
      calculatedTax = Math.round(grossAmount * 0.05);
    } else if (taxType === 'pph23') {
      calculatedTax = Math.round(grossAmount * 0.02);
    } else if (taxType === 'ppn') {
      calculatedTax = Math.round(grossAmount * 0.11);
    }
  }

  // Unggah berkas ke Cloudinary
  const uploadResult = await uploadToCloudinary(receiptFile, `sim_riset/projects/${projectId}`);
  if ('error' in uploadResult) {
    return { error: uploadResult.error };
  }

  const { error: dbError } = await supabase.from('expenses').insert({
    project_id: projectId,
    budget_item_id: budgetItemId,
    expense_date: expenseDate,
    description,
    gross_amount: grossAmount,
    tax_type: taxType,
    tax_amount: calculatedTax,
    receipt_cloudinary_url: uploadResult.secure_url,
    receipt_public_id: uploadResult.public_id,
    created_by: user.id,
    verified_by_pi: true,
  });

  if (dbError) return { error: dbError.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/expenses');
  return { success: true };
}

// 10. Hapus Catatan Belanja
export async function deleteExpense(expenseId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/expenses');
  return { success: true };
}

// 11. Tambah Aturan Pengingat Telegram Baru
export async function createNotificationRule(formData: FormData) {
  const supabase = await createClient();
  const projectId = formData.get('projectId') as string;
  const eventType = formData.get('eventType') as string;
  const triggerOffsetDays = parseInt(formData.get('triggerOffsetDays') as string, 10);
  const dispatchTime = (formData.get('dispatchTime') as string) || '08:00:00';
  const targetChannel = (formData.get('targetChannel') as string) || 'both';

  if (!projectId || !eventType || isNaN(triggerOffsetDays)) {
    return { error: 'Semua kolom aturan pengingat wajib diisi.' };
  }

  const { error } = await supabase.from('notification_rules').insert({
    project_id: projectId,
    event_type: eventType,
    trigger_offset_days: triggerOffsetDays,
    dispatch_time: dispatchTime,
    target_channel: targetChannel,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 12. Hapus Aturan Pengingat
export async function deleteNotificationRule(ruleId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('notification_rules').delete().eq('id', ruleId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 13. Aktif/Nonaktifkan Aturan Pengingat
export async function toggleNotificationRule(ruleId: string, projectId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notification_rules')
    .update({ is_active: isActive })
    .eq('id', ruleId);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// 14. Tambah Luaran Riset (Publikasi, HKI, Prototipe)
export async function createResearchOutput(formData: FormData) {
  const supabase = await createClient();
  const projectId = formData.get('projectId') as string;
  const outputType = formData.get('outputType') as string;
  const title = formData.get('title') as string;
  const targetOutlet = formData.get('targetOutlet') as string;
  const status = (formData.get('status') as string) || 'drafting';
  const currentDeadline = (formData.get('currentDeadline') as string) || null;
  const doiOrRegNumber = (formData.get('doiOrRegNumber') as string) || null;
  const documentUrl = (formData.get('documentUrl') as string) || null;

  if (!projectId || !outputType || !title) {
    return { error: 'Jenis luaran dan judul naskah/luaran wajib diisi.' };
  }

  const { error } = await supabase.from('research_outputs').insert({
    project_id: projectId,
    output_type: outputType,
    title,
    target_outlet: targetOutlet || null,
    status,
    current_deadline: currentDeadline || null,
    doi_or_reg_number: doiOrRegNumber,
    document_url: documentUrl,
  });

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/outputs');
  return { success: true };
}

// 15. Hapus Luaran Riset
export async function deleteResearchOutput(outputId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('research_outputs').delete().eq('id', outputId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/outputs');
  return { success: true };
}

// 16. Update Status Luaran Riset
export async function updateResearchOutputStatus(outputId: string, projectId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('research_outputs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', outputId);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/outputs');
  return { success: true };
}
