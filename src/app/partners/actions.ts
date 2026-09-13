'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createPartner(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const organizationType = formData.get('organizationType') as string;
  const picName = formData.get('picName') as string;
  const picEmail = formData.get('picEmail') as string;
  const picPhone = formData.get('picPhone') as string;
  const mouDocumentUrl = formData.get('mouDocumentUrl') as string;

  if (!name || !organizationType || !picName) {
    return { error: 'Nama institusi mitra, jenis organisasi, dan nama PIC wajib diisi.' };
  }

  const { error } = await supabase.from('partners').insert({
    name,
    organization_type: organizationType,
    pic_name: picName,
    pic_email: picEmail || null,
    pic_phone: picPhone || null,
    mou_document_url: mouDocumentUrl || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/partners');
  return { success: true };
}
