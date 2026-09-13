const fs = require('fs');
const path = require('path');

// Baca .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Environment variables NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan.');
  process.exit(1);
}

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// 1. Definisi User Dummy untuk Semua Role
const DEMO_PASSWORD = 'DemoPassword2026!';

const DUMMY_USERS = [
  {
    role: 'pi',
    email: 'pi.demo@simriset.ac.id',
    password: DEMO_PASSWORD,
    full_name: 'Prof. Dr. Ir. Wahyu Hidayat, M.Kom.',
    nidn_nim: '0015087501',
    institution: 'Program Studi Sistem Informasi',
    description: 'Principal Investigator (Ketua Peneliti / Dosen Utama)'
  },
  {
    role: 'co_pi',
    email: 'copi.demo@simriset.ac.id',
    password: DEMO_PASSWORD,
    full_name: 'Dr. Rina Anggraini, S.Kom., M.T.',
    nidn_nim: '0712058801',
    institution: 'Departemen Teknik Informatika',
    description: 'Co-Principal Investigator (Dosen Anggota Peneliti)'
  },
  {
    role: 'student_ra',
    email: 'student.demo@simriset.ac.id',
    password: DEMO_PASSWORD,
    full_name: 'Bagas Pratama Putra',
    nidn_nim: '202102001',
    institution: 'Sistem Informasi - MBKM Riset',
    description: 'Student Research Assistant (Mahasiswa Asisten Riset / MBKM)'
  },
  {
    role: 'partner',
    email: 'partner.demo@simriset.ac.id',
    password: DEMO_PASSWORD,
    full_name: 'Ir. Hendra Wijaya',
    nidn_nim: 'MITRA-IND-01',
    institution: 'PT Inovasi Teknologi Nusantara',
    description: 'External Partner / PIC Mitra Industri'
  },
  {
    role: 'auditor',
    email: 'auditor.demo@simriset.ac.id',
    password: DEMO_PASSWORD,
    full_name: 'Dra. Sri Wahyuni, M.Ak., Ak., CA',
    nidn_nim: '197508142000032001',
    institution: 'Badan Penjaminan Mutu & LPPM Kampus',
    description: 'Auditor Internal / Reviewer Keuangan SPJ'
  }
];

async function seed() {
  console.log('=== SEEDING DUMMY USERS UNTUK SEMUA ROLE ===\n');

  // Ambil user auth yang ada saat ini
  const existingUsersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers });
  const existingUsersData = await existingUsersRes.json();
  const existingUsers = existingUsersData.users || [];

  const userMap = {}; // email -> id

  // Simpan user yang sudah ada (misal tikno@uisi.ac.id)
  existingUsers.forEach(u => {
    userMap[u.email.toLowerCase()] = u.id;
  });

  // Loop setiap dummy user
  for (const dummy of DUMMY_USERS) {
    let userId = userMap[dummy.email.toLowerCase()];

    if (!userId) {
      console.log(`[AUTH] Membuat user: ${dummy.email} (${dummy.role})...`);
      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: dummy.email,
          password: dummy.password,
          email_confirm: true,
          user_metadata: {
            full_name: dummy.full_name,
            nidn_nim: dummy.nidn_nim,
            institution: dummy.institution,
            system_role: dummy.role
          }
        })
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        console.error(`Gagal membuat ${dummy.email}:`, err);
        continue;
      }

      const created = await createRes.json();
      userId = created.id;
      console.log(`  -> Berhasil dibuat dengan ID: ${userId}`);
    } else {
      console.log(`[AUTH] User ${dummy.email} sudah ada (ID: ${userId}). Memperbarui metadata...`);
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          password: dummy.password,
          user_metadata: {
            full_name: dummy.full_name,
            nidn_nim: dummy.nidn_nim,
            institution: dummy.institution,
            system_role: dummy.role
          }
        })
      });
    }

    userMap[dummy.email.toLowerCase()] = userId;

    // Pastikan di tabel profiles terisi lengkap
    await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({
        id: userId,
        full_name: dummy.full_name,
        nidn_nim: dummy.nidn_nim,
        institution: dummy.institution,
        updated_at: new Date().toISOString()
      })
    });
  }

  // Ambil project demo yang ada
  const projRes = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=*&limit=1`, { headers });
  const projects = await projRes.json();

  if (!projects || projects.length === 0) {
    console.log('Tidak ada project ditemukan di database.');
    return;
  }

  const project = projects[0];
  console.log(`\n=== MENGAITKAN ROLE KE PROYEK DEMO: "${project.title}" (ID: ${project.id}) ===\n`);

  // Pastikan creator project juga tercatat sebagai 'pi'
  if (project.created_by) {
    await fetch(`${SUPABASE_URL}/rest/v1/project_members`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=ignore-duplicates' },
      body: JSON.stringify({
        project_id: project.id,
        user_id: project.created_by,
        role: 'pi'
      })
    });
    console.log(`[MEMBER] Project creator (${project.created_by}) dikonfirmasi sebagai PI`);
  }

  // Daftarkan semua dummy users ke project_members
  for (const dummy of DUMMY_USERS) {
    const userId = userMap[dummy.email.toLowerCase()];
    if (!userId) continue;

    // Hapus dulu jika sudah ada agar bisa re-assign role
    await fetch(`${SUPABASE_URL}/rest/v1/project_members?project_id=eq.${project.id}&user_id=eq.${userId}`, {
      method: 'DELETE',
      headers
    });

    const addMemberRes = await fetch(`${SUPABASE_URL}/rest/v1/project_members`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        project_id: project.id,
        user_id: userId,
        role: dummy.role
      })
    });

    if (addMemberRes.ok) {
      console.log(`[MEMBER] ${dummy.full_name} (${dummy.email}) ditambahkan sebagai role: [${dummy.role}]`);
    } else {
      console.error(`[MEMBER FAIL] ${dummy.email}:`, await addMemberRes.text());
    }
  }

  // Cek apakah tasks dan logbooks sudah ada
  const taskRes = await fetch(`${SUPABASE_URL}/rest/v1/tasks?project_id=eq.${project.id}`, { headers });
  const tasks = await taskRes.json();

  const studentId = userMap['student.demo@simriset.ac.id'];
  const coPiId = userMap['copi.demo@simriset.ac.id'];

  if (tasks.length === 0) {
    console.log('\n=== SEEDING TASKS (WBS) & LOGBOOK MAHASISWA ===');
    const demoTasks = [
      {
        project_id: project.id,
        title: 'Review Literatur & Benchmarking Arsitektur Sistem',
        description: 'Mengkaji 10 artikel Scopus Q1 terkait sistem cerdas dan arsitektur microservices.',
        status: 'done',
        priority: 3,
        due_date: new Date(Date.now() - 14 * 86400000).toISOString(),
        assigned_to: studentId
      },
      {
        project_id: project.id,
        title: 'Perancangan Skema Database & API Contract',
        description: 'Mendesain ERD relasional PostgreSQL dan spesifikasi OpenAPI/Swagger.',
        status: 'done',
        priority: 3,
        due_date: new Date(Date.now() - 7 * 86400000).toISOString(),
        assigned_to: studentId
      },
      {
        project_id: project.id,
        title: 'Implementasi Core Backend & Integrasi Telegram Bot',
        description: 'Membangun webhook telegram dispatcher dan algoritma idempotensi pengingat.',
        status: 'in_progress',
        priority: 4,
        due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
        assigned_to: studentId
      },
      {
        project_id: project.id,
        title: 'Penyusunan Draf Artikel Jurnal Scopus',
        description: 'Menulis bagian Methodology dan Preliminary Results untuk disubmit ke IEEE Access.',
        status: 'todo',
        priority: 4,
        due_date: new Date(Date.now() + 20 * 86400000).toISOString(),
        assigned_to: coPiId
      }
    ];

    for (const t of demoTasks) {
      await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(t)
      });
    }
    console.log(`[TASKS] ${demoTasks.length} task berhasil dibuat.`);

    // Buat Logbooks untuk Student RA
    const demoLogbooks = [
      {
        project_id: project.id,
        user_id: studentId,
        activity_date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
        activity_description: 'Eksplorasi pustaka Telegram Bot API dan perancangan skema notifikasi otomatis.',
        hours_spent: 6,
        evidence_url: 'https://github.com/gustyk/manajemen-riset/commit/912331d',
        status: 'approved',
        lecturer_feedback: 'Bagus, metodologi sudah sesuai dengan roadmap Sprint 1.'
      },
      {
        project_id: project.id,
        user_id: studentId,
        activity_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        activity_description: 'Pengerjaan modul upload bukti pengeluaran ke Cloudinary dan integrasi kalkulator pajak SBM.',
        hours_spent: 7,
        evidence_url: 'https://github.com/gustyk/manajemen-riset/commit/912331d',
        status: 'approved',
        lecturer_feedback: 'Perhitungan PPh 21 dan PPh 23 sudah akurat.'
      },
      {
        project_id: project.id,
        user_id: studentId,
        activity_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
        activity_description: 'Penyusunan template cetak Buku Kas Pembantu (SPJ) dan lembar transkrip ekuivalensi MBKM.',
        hours_spent: 5,
        evidence_url: 'https://github.com/gustyk/manajemen-riset/commit/912331d',
        status: 'submitted',
        lecturer_feedback: null
      }
    ];

    for (const lb of demoLogbooks) {
      await fetch(`${SUPABASE_URL}/rest/v1/logbooks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(lb)
      });
    }
    console.log(`[LOGBOOKS] ${demoLogbooks.length} logbook mahasiswa berhasil dibuat.`);
  }

  // Cek Budget Items & Expenses
  const budgetRes = await fetch(`${SUPABASE_URL}/rest/v1/budget_items?project_id=eq.${project.id}`, { headers });
  const budgets = await budgetRes.json();

  if (budgets.length === 0) {
    console.log('\n=== SEEDING RAB (BUDGET ITEMS) & PENGELUARAN (EXPENSES) ===');
    const demoBudgets = [
      {
        project_id: project.id,
        category: 'honorarium',
        description: 'Honorarium Mahasiswa Asisten Peneliti (3 bln x Rp 1.500.000)',
        unit_price: 1500000,
        quantity: 3
      },
      {
        project_id: project.id,
        category: 'bahan_habis_pakai',
        description: 'ATK Riset, Kertas SPJ, Tinta & Harddisk Eksternal Backup Data',
        unit_price: 2500000,
        quantity: 1
      },
      {
        project_id: project.id,
        category: 'luaran_publikasi',
        description: 'Article Processing Charge (APC) Publikasi Jurnal Terakreditasi Sinta 2',
        unit_price: 3500000,
        quantity: 1
      }
    ];

    const createdBudgets = [];
    for (const b of demoBudgets) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/budget_items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(b)
      });
      const data = await r.json();
      if (data && data[0]) createdBudgets.push(data[0]);
    }
    console.log(`[RAB] ${createdBudgets.length} pos anggaran berhasil dibuat.`);

    // Expenses
    if (createdBudgets.length > 0) {
      const demoExpenses = [
        {
          project_id: project.id,
          budget_item_id: createdBudgets[0].id,
          expense_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
          description: 'Pembayaran Honorarium Mahasiswa RA Bulan ke-1 (Potong PPh 21 5%)',
          gross_amount: 1500000,
          tax_type: 'pph21',
          tax_amount: 75000,
          receipt_cloudinary_url: 'https://res.cloudinary.com/bodeayug/image/upload/v1710300000/sample_receipt_honor.jpg',
          receipt_public_id: 'sample_receipt_honor',
          verified_by_pi: true,
          created_by: project.created_by
        },
        {
          project_id: project.id,
          budget_item_id: createdBudgets[1].id,
          expense_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
          description: 'Pengadaan Harddisk Eksternal & Paket Kertas Laporan Antara (PPN 11%)',
          gross_amount: 1750000,
          tax_type: 'ppn',
          tax_amount: 173423,
          receipt_cloudinary_url: 'https://res.cloudinary.com/bodeayug/image/upload/v1710300000/sample_receipt_atk.jpg',
          receipt_public_id: 'sample_receipt_atk',
          verified_by_pi: false,
          created_by: project.created_by
        }
      ];

      for (const exp of demoExpenses) {
        await fetch(`${SUPABASE_URL}/rest/v1/expenses`, {
          method: 'POST',
          headers,
          body: JSON.stringify(exp)
        });
      }
      console.log(`[EXPENSES] ${demoExpenses.length} transaksi pengeluaran SPJ berhasil dibuat.`);
    }
  }

  // Cek Research Outputs
  const outputRes = await fetch(`${SUPABASE_URL}/rest/v1/research_outputs?project_id=eq.${project.id}`, { headers });
  const outputs = await outputRes.json();

  if (outputs.length === 0) {
    console.log('\n=== SEEDING RESEARCH OUTPUTS (LUARAN) ===');
    const demoOutputs = [
      {
        project_id: project.id,
        output_type: 'scopus_journal',
        title: 'Autonomous Multi-Agent Task Orchestration in Higher Education Research Laboratories',
        target_outlet: 'IEEE Access (Scopus Q1)',
        status: 'under_review',
        current_deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        doi_or_reg_number: '10.1109/ACCESS.2026.DEMO99'
      },
      {
        project_id: project.id,
        output_type: 'hki_copyright',
        title: 'SIM-Riset: Sistem Informasi Manajemen Portofolio Riset dan Otomasi Pengingat Berbasis Telegram',
        target_outlet: 'DJKI Kemenkumham RI',
        status: 'accepted',
        current_deadline: null,
        doi_or_reg_number: 'EC00202612345'
      },
      {
        project_id: project.id,
        output_type: 'software_prototype',
        title: 'Platform Web Next.js SIM-Riset Terintegrasi Supabase & Telegram Bot',
        target_outlet: 'Repositori GitHub & Vercel Staging',
        status: 'published',
        current_deadline: null,
        doi_or_reg_number: 'https://github.com/gustyk/manajemen-riset'
      }
    ];

    for (const out of demoOutputs) {
      await fetch(`${SUPABASE_URL}/rest/v1/research_outputs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(out)
      });
    }
    console.log(`[OUTPUTS] ${demoOutputs.length} capaian luaran riset berhasil dibuat.`);
  }

  // Cek Mitra Industri (Partner)
  const partnerRes = await fetch(`${SUPABASE_URL}/rest/v1/partners`, { headers });
  const partners = await partnerRes.json();

  if (partners.length === 0) {
    console.log('\n=== SEEDING MITRA RISET (PARTNER) ===');
    const createPartner = await fetch(`${SUPABASE_URL}/rest/v1/partners`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'PT Inovasi Teknologi Nusantara',
        organization_type: 'Industri Teknologi & Software House',
        pic_name: 'Ir. Hendra Wijaya',
        pic_email: 'partner.demo@simriset.ac.id',
        pic_phone: '081234567890',
        mou_document_url: 'https://storage.kampus.ac.id/mou/mou-pt-inovasi-2026.pdf'
      })
    });
    const partnerData = await createPartner.json();
    if (partnerData && partnerData[0]) {
      // Hubungkan ke project
      await fetch(`${SUPABASE_URL}/rest/v1/project_partners`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=ignore-duplicates' },
        body: JSON.stringify({
          project_id: project.id,
          partner_id: partnerData[0].id,
          contribution_type: 'In-Kind & Akses Server Cloud',
          contribution_nominal: 25000000
        })
      });
      console.log(`[PARTNER] Mitra industri "${partnerData[0].name}" berhasil didaftarkan.`);
    }
  }

  console.log('\n=== SEEDING SELESAI DENGAN SUKSES! ===');
}

seed().catch(err => {
  console.error('Error saat seeding:', err);
  process.exit(1);
});
