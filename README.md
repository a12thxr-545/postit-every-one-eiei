# 📌 Minimal Post-it Whiteboard Dashboard

กระดานไวท์บอร์ดมินิมอลสีขาว สำหรับแปะ Post-it ข้อความ ไอเดีย โน้ตลายมือ และรูปภาพ รองรับการทำงานร่วมกันแบบ Real-time, ระบบสร้างห้อง/กระดานทั้งแบบสาธารณะและแบบล็อกรหัสผ่าน โดยไม่ต้องสมัครสมาชิกหรือ Login

![Minimal Post-it Board](https://raw.githubusercontent.com/a12thxr-545/postit-every-one-eiei/main/public/preview.png)

---

## ✨ ฟีเจอร์หลัก (Features)

- 🎨 **Whiteboard Theme Minimal**: พื้นหลังกระดานไวท์บอร์ดแบบ Dot Grid สะอาดตา ดีไซน์ Post-it สไตล์มินิมอล พร้อมเทปใสประดับและฟอนต์ลายมือ
- 📝 **Animated Landing Page**: หน้าแรกพร้อมแผ่น Post-it ลอยได้เขียนว่า `write to postit` คลิกเพื่อเข้าสู่กระดานได้ทันที
- 📌 **Post-it แปะข้อความ & รูปภาพ**:
  - รองรับข้อความ โน้ตลายมือ หรือ Monospace code
  - **แนบรูปภาพประกอบ**: รองรับไฟล์รูปภาพจากเครื่อง (พร้อมระบบ Auto-Compress ย่อขนาดภาพอัตโนมัติ) และ Image URL
  - **ระบบ Like / Unlike**: กดถูกใจ และกดซ้ำเพื่อยกเลิกถูกใจได้
  - เลือกสี Post-it สไตล์มินิมอลได้ 7 เฉดสี (*Soft Yellow, Warm Peach, Sage Mint, Ice Blue, Lavender, Rose Blush, Minimal White*)
- 🖐️ **Freeform & Grid Mode**:
  - **โหมดอิสระ (Freeform)**: ลากย้ายตำแหน่ง Post-it บนกระดานได้อย่างอิสระ
  - **โหมดตาราง (Grid View)**: สลับเป็นมุมมองจัดเรียงตารางเป็นระเบียบ
  - **ดับเบิ้ลคลิกบนกระดาน**: ดับเบิ้ลคลิกพื้นที่ว่างเพื่อวาง Post-it ใหม่ที่ตำแหน่งนั้นได้ทันที
- 🔐 **ระบบจัดการห้อง & รหัสผ่าน (Room Management)**:
  - สร้างห้อง/กระดานใหม่ได้ไม่จำกัด
  - เลือกสร้างเป็น **กระดานสาธารณะ** หรือ **ตั้งรหัสผ่านล็อกห้อง** ได้
  - แชร์ลิงก์ห้องให้เพื่อนย้ายเข้ากระดานเดียวกันได้ทันที
- ⚡ **Real-time Live Sync**: อัปเดตการแปะโน้ต ลบโน้ต เปลี่ยนสี หรือลากย้ายโน้ตผ่าน **WebSocket Server** แบบสดๆ
- 👤 **No Login Required**: ไม่ต้องสมัครสมาชิก เพียงระบุชื่อ Display Name ในครั้งแรก ชื่อจะถูกนำไปแสดงเป็นป้ายชื่อผู้แปะบน Post-it
- ☁️ **Supabase & SQLite Support**: รองรับทั้งฐานข้อมูล SQLite ท้องถิ่น (`postit.db`) และการเชื่อมต่อ Supabase Cloud Database

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
- **React 19** - UI Framework
- **Vite 6** - Lightning fast build tool
- **Lucide React** - UI Minimal Icons
- **Canvas Confetti** - Celebration effects

### Backend
- **Node.js & Express** - REST API Server
- **Better-SQLite3** - Fast local file database
- **WS (WebSocket)** - Real-time multiplayer synchronization
- **@supabase/supabase-js** - Supabase Client SDK

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. คลองและติดตั้ง Dependencies

```bash
git clone https://github.com/a12thxr-545/postit-every-one-eiei.git
cd postit-every-one-eiei
npm install
```

### 2. รันโปรเจกต์ในโหมดพัฒนา (Development)

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3001`

### 3. การสร้าง Build สำหรับนำไปใช้งานจริง (Production Build)

```bash
npm run build
npm run server
```

---

## ⚡ การเชื่อมต่อ Supabase (Optional)

หากต้องการใช้งาน Supabase เป็นฐานข้อมูล Cloud:

1. คัดลอกไฟล์ `.env.example` เป็น `.env`:
   ```bash
   cp .env.example .env
   ```
2. ใส่ค่า `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` จาก Supabase Dashboard (Settings > API) ลงในไฟล์ `.env`
3. คัดลอกข้อความในสคริปต์ [`supabase-schema.sql`](./supabase-schema.sql) ไปวางและกด **Run** ใน Supabase SQL Editor เพื่อสร้างตารางและเปิดใช้งาน Realtime

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/rooms` | ดึงรายชื่อห้อง/กระดานทั้งหมด |
| `POST` | `/api/rooms` | สร้างห้องใหม่ (รองรับรหัสผ่าน) |
| `POST` | `/api/rooms/:id/verify` | ตรวจสอบรหัสผ่านของห้อง |
| `GET` | `/api/rooms/:id/notes` | ดึงข้อมูล Post-it บนกระดาน |
| `POST` | `/api/rooms/:id/notes` | เพิ่ม Post-it ใหม่บนกระดาน |
| `PUT` | `/api/notes/:id` | แก้ไขข้อความ สี พิกัด x-y หรือ z-index |
| `POST` | `/api/notes/:id/toggle-like` | กดถูกใจ หรือ ยกเลิกถูกใจ |
| `DELETE` | `/api/notes/:id` | ลบ Post-it |

---

## 📄 License

MIT License
