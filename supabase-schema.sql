-- ========================================================
-- Minimal Post-it Board Database Schema for Supabase
-- วาง Code นี้ลงใน Supabase SQL Editor เพื่อสร้าง Tables & Policies
-- ========================================================

-- 1. Create Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NULL,
  color TEXT DEFAULT 'yellow',
  font_style TEXT DEFAULT 'sans',
  x_pos INTEGER DEFAULT 100,
  y_pos INTEGER DEFAULT 100,
  z_index INTEGER DEFAULT 1,
  pinned INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Allow public read access to rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to notes" ON public.notes FOR SELECT USING (true);

-- Allow Public Insert Access
CREATE POLICY "Allow public insert access to rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access to notes" ON public.notes FOR INSERT WITH CHECK (true);

-- Allow Public Update Access
CREATE POLICY "Allow public update access to rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Allow public update access to notes" ON public.notes FOR UPDATE USING (true);

-- Allow Public Delete Access
CREATE POLICY "Allow public delete access to notes" ON public.notes FOR DELETE USING (true);

-- 4. Enable Supabase Realtime Replication for Instant Live Sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;

-- 5. Seed Default Rooms
INSERT INTO public.rooms (id, name, password) VALUES
  ('general', 'กระดานทั่วไป (General Board)', NULL),
  ('brainstorm', 'ระดมความคิด (Brainstorming)', NULL),
  ('random', 'พูดคุยเรื่อยเปื่อย (Random)', NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Notes
INSERT INTO public.notes (id, room_id, author_name, content, color, font_style, x_pos, y_pos, z_index, likes) VALUES
  ('welcome-1', 'general', 'แอดมิน (Admin)', 'ยินดีต้อนรับสู่ Minimal Post-it Board\nพิมพ์ข้อความเพื่อเพิ่ม Post-it ใหม่บนกระดานได้เลยครับ', 'yellow', 'handwriting', 120, 100, 1, 5),
  ('welcome-2', 'general', 'ทีมงาน Minimal', 'ฟีเจอร์การใช้งาน:\n• ลาก post-it ย้ายไปมาได้อย่างอิสระ\n• สามารถกดเปลี่ยนสีตามสไตล์ minimal\n• แนบรูปภาพประกอบใน post-it ได้\n• สร้างห้องใส่รหัสหรือไม่ใส่ก็ได้', 'green', 'sans', 460, 120, 2, 8),
  ('welcome-3', 'general', 'มินิมอลบอย', 'กระดานสะอาด ใช้งานง่าย ชอบดีไซน์แบบนี้มากครับ', 'white', 'handwriting', 280, 360, 3, 3)
ON CONFLICT (id) DO NOTHING;
