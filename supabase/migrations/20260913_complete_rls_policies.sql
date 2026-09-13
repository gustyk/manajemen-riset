-- ==============================================================================
-- SISTEM INFORMASI MANAJEMEN RISET (SIM-RISET)
-- Kebijakan Row Level Security (RLS) Lengkap & Hak Akses Berbasis Peran (RBAC)
-- Eksekusi skrip ini di Supabase Dashboard -> SQL Editor jika ingin memperbarui
-- seluruh RLS policy untuk semua role (PI, Co-PI, Student RA, Partner, Auditor).
-- ==============================================================================

-- 1. Pastikan RLS Aktif pada Seluruh Tabel
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
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_partners ENABLE ROW LEVEL SECURITY;

-- 2. Drop Kebijakan Lama jika Ada (agar Idempoten)
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Members or creators can view projects" ON projects;
DROP POLICY IF EXISTS "Creators can update projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;

DROP POLICY IF EXISTS "Members can view project_members" ON project_members;
DROP POLICY IF EXISTS "PI can manage project_members" ON project_members;

DROP POLICY IF EXISTS "Members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Members can manage tasks" ON tasks;

DROP POLICY IF EXISTS "Students manage own logbooks" ON logbooks;
DROP POLICY IF EXISTS "Lecturers view logbooks of their projects" ON logbooks;
DROP POLICY IF EXISTS "Lecturers can update review on logbooks" ON logbooks;

DROP POLICY IF EXISTS "Members can view budget_items" ON budget_items;
DROP POLICY IF EXISTS "PI and Co-PI can manage budget_items" ON budget_items;

DROP POLICY IF EXISTS "Only PI and Co-PI can view expenses" ON expenses;
DROP POLICY IF EXISTS "Authorized members can view expenses" ON expenses;
DROP POLICY IF EXISTS "PI and Co-PI can manage expenses" ON expenses;

DROP POLICY IF EXISTS "Members can view research_outputs" ON research_outputs;
DROP POLICY IF EXISTS "PI and Co-PI can manage research_outputs" ON research_outputs;

DROP POLICY IF EXISTS "Members can view partners" ON partners;
DROP POLICY IF EXISTS "Members can view project_partners" ON project_partners;

-- 3. PROFILES
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 4. PROJECT MEMBERS
CREATE POLICY "Members can view project_members" 
ON project_members FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "PI can manage project_members" 
ON project_members FOR ALL TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role = 'pi')
);

-- 5. PROJECTS
CREATE POLICY "Members or creators can view projects" 
ON projects FOR SELECT TO authenticated 
USING (
    created_by = auth.uid() OR 
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
);

CREATE POLICY "Creators can update projects" 
ON projects FOR UPDATE TO authenticated 
USING (
    created_by = auth.uid() OR
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role = 'pi')
);

CREATE POLICY "Users can create projects" 
ON projects FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

-- 6. TASKS (WBS / KANBAN)
CREATE POLICY "Members can view tasks" 
ON tasks FOR SELECT TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
);

CREATE POLICY "Members can manage tasks" 
ON tasks FOR ALL TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi', 'student_ra'))
);

-- 7. LOGBOOKS
CREATE POLICY "Students manage own logbooks" 
ON logbooks FOR ALL TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Lecturers view logbooks of their projects" 
ON logbooks FOR SELECT TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi', 'auditor'))
);

CREATE POLICY "Lecturers can update review on logbooks" 
ON logbooks FOR UPDATE TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi'))
);

-- 8. BUDGET ITEMS (RAB)
CREATE POLICY "Members can view budget_items" 
ON budget_items FOR SELECT TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi', 'auditor', 'partner'))
);

CREATE POLICY "PI and Co-PI can manage budget_items" 
ON budget_items FOR ALL TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi'))
);

-- 9. EXPENSES & BUKTI KUITANSI SPJ
CREATE POLICY "Authorized members can view expenses" 
ON expenses FOR SELECT TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi', 'auditor'))
);

CREATE POLICY "PI and Co-PI can manage expenses" 
ON expenses FOR ALL TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi'))
);

-- 10. RESEARCH OUTPUTS (PUBLIKASI & HKI)
CREATE POLICY "Members can view research_outputs" 
ON research_outputs FOR SELECT TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
);

CREATE POLICY "PI and Co-PI can manage research_outputs" 
ON research_outputs FOR ALL TO authenticated 
USING (
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('pi', 'co_pi'))
);

-- 11. MITRA & KERJASAMA
CREATE POLICY "Members can view partners" 
ON partners FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Members can view project_partners" 
ON project_partners FOR SELECT TO authenticated 
USING (true);
