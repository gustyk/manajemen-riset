-- ==============================================================================
-- SISTEM INFORMASI MANAJEMEN RISET (SIM-RISET)
-- Initial Database Migration & Schema Definition
-- Eksekusi file ini di Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('pi', 'co_pi', 'student_ra', 'partner', 'auditor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_scheme_enum AS ENUM ('kemdikbud_bima', 'brin', 'internal_kampus', 'matching_fund', 'industri', 'mandiri');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status_enum AS ENUM ('draft', 'submitted', 'funded', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status_enum AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE logbook_status_enum AS ENUM ('submitted', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE budget_category_enum AS ENUM ('bahan_habis_pakai', 'sewa_alat', 'perjalanan', 'honorarium', 'luaran_publikasi', 'lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tax_type_enum AS ENUM ('none', 'pph21', 'pph23', 'ppn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE output_type_enum AS ENUM ('scopus_journal', 'sinta_journal', 'conference_paper', 'hki_copyright', 'patent', 'software_prototype', 'book');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE output_status_enum AS ENUM ('drafting', 'submitted', 'under_review', 'revision', 'accepted', 'published', 'granted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_event_enum AS ENUM ('proposal_deadline', 'task_deadline', 'interim_report', 'final_report', 'spj_deadline', 'journal_revision');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_target_enum AS ENUM ('personal', 'group', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES (Terikat ke Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    nidn_nim TEXT,
    institution TEXT DEFAULT 'Program Studi Sistem Informasi',
    phone_number TEXT,
    telegram_chat_id BIGINT UNIQUE,
    telegram_username TEXT,
    telegram_auth_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PARTNERS (Mitra Industri / Institusi Eksternal)
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    organization_type TEXT NOT NULL, -- Industri, Pemerintahan, UMKM, Komunitas
    pic_name TEXT NOT NULL,
    pic_email TEXT,
    pic_phone TEXT,
    mou_document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROJECTS (Proyek Riset)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    focus_area TEXT NOT NULL, -- Klaster Riset SI
    scheme project_scheme_enum NOT NULL,
    fiscal_year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget NUMERIC(15, 2) DEFAULT 0.00,
    status project_status_enum DEFAULT 'draft',
    telegram_group_id BIGINT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROJECT PARTNERS (Relasi Many-to-Many)
CREATE TABLE IF NOT EXISTS project_partners (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    contribution_type TEXT DEFAULT 'in_kind',
    contribution_nominal NUMERIC(15, 2) DEFAULT 0.00,
    PRIMARY KEY (project_id, partner_id)
);

-- 7. PROJECT MEMBERS (Dosen Anggota & Mahasiswa RA)
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 8. TASKS (WBS / Kanban Board)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status task_status_enum DEFAULT 'todo',
    priority INT DEFAULT 2, -- 1: Low, 2: Medium, 3: High, 4: Critical
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. LOGBOOKS (Catatan Kegiatan Harian Mahasiswa / RA)
CREATE TABLE IF NOT EXISTS logbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_description TEXT NOT NULL,
    hours_spent INT NOT NULL DEFAULT 1,
    evidence_url TEXT,
    status logbook_status_enum DEFAULT 'submitted',
    lecturer_feedback TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BUDGET ITEMS (Rencana Anggaran Biaya - RAB)
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    category budget_category_enum NOT NULL,
    description TEXT NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_planned NUMERIC(15, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EXPENSES (Realisasi Belanja & Bukti Kuitansi SPJ)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    budget_item_id UUID REFERENCES budget_items(id) ON DELETE SET NULL,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL,
    gross_amount NUMERIC(15, 2) NOT NULL,
    tax_type tax_type_enum DEFAULT 'none',
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    net_amount NUMERIC(15, 2) GENERATED ALWAYS AS (gross_amount - tax_amount) STORED,
    receipt_cloudinary_url TEXT NOT NULL,
    receipt_public_id TEXT NOT NULL,
    verified_by_pi BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. RESEARCH OUTPUTS (Luaran Publikasi, HKI & Prototipe)
CREATE TABLE IF NOT EXISTS research_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    output_type output_type_enum NOT NULL,
    title TEXT NOT NULL,
    target_outlet TEXT,
    status output_status_enum DEFAULT 'drafting',
    current_deadline DATE,
    doi_or_reg_number TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATION RULES (Aturan Pengingat Telegram Terkonfigurasi)
CREATE TABLE IF NOT EXISTS notification_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_type reminder_event_enum NOT NULL,
    trigger_offset_days INT NOT NULL, -- Contoh: -7, -3, -1, 0
    dispatch_time TIME NOT NULL DEFAULT '08:00:00',
    target_channel reminder_target_enum DEFAULT 'both',
    custom_message_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NOTIFICATION LOGS (Audit Trail & Idempotency)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES notification_rules(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    recipient_chat_id BIGINT NOT NULL,
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    message_content TEXT NOT NULL,
    is_successful BOOLEAN DEFAULT TRUE,
    telegram_response_code INT,
    idempotency_key TEXT UNIQUE NOT NULL
);

-- 15. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy Profiles
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Policy Projects
CREATE POLICY "Members or creators can view projects" 
ON projects FOR SELECT TO authenticated 
USING (
    created_by = auth.uid() OR 
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
);

CREATE POLICY "Creators can update projects" 
ON projects FOR UPDATE TO authenticated 
USING (created_by = auth.uid());

CREATE POLICY "Users can create projects" 
ON projects FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Policy Logbooks
CREATE POLICY "Students manage own logbooks" 
ON logbooks FOR ALL TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Lecturers view logbooks of their projects" 
ON logbooks FOR SELECT TO authenticated 
USING (
    project_id IN (
        SELECT project_id FROM project_members 
        WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi')
    ) OR 
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
);

-- Policy Expenses
CREATE POLICY "Only PI and Co-PI can view expenses" 
ON expenses FOR SELECT TO authenticated 
USING (
    project_id IN (
        SELECT project_id FROM project_members 
        WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi')
    ) OR 
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
);

-- Trigger Otomatis Profil Pengguna saat Registrasi di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, nidn_nim)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'nidn_nim'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
