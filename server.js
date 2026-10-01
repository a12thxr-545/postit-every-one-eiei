import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express & HTTP Server
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize SQLite Database
const db = new Database(path.join(__dirname, 'postit.db'));

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    color TEXT DEFAULT 'yellow',
    font_style TEXT DEFAULT 'sans',
    x_pos INTEGER DEFAULT 100,
    y_pos INTEGER DEFAULT 100,
    z_index INTEGER DEFAULT 1,
    pinned INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
  );
`);

// Migration for existing databases
try { db.exec("ALTER TABLE rooms ADD COLUMN password TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE notes ADD COLUMN image_url TEXT;"); } catch(e) {}

// WebSocket broadcast helper
function broadcast(message, senderWs = null) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== senderWs) {
      client.send(data);
    }
  });
}

// API Routes

// Get all rooms
app.get('/api/rooms', (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT r.id, r.name, r.created_at, 
             CASE WHEN r.password IS NOT NULL AND r.password != '' THEN 1 ELSE 0 END as is_protected,
             COUNT(n.id) as note_count 
      FROM rooms r 
      LEFT JOIN notes n ON r.id = n.room_id 
      GROUP BY r.id 
      ORDER BY r.created_at ASC
    `).all();
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify Room Password
app.post('/api/rooms/:roomId/verify', (req, res) => {
  try {
    const { roomId } = req.params;
    const { password } = req.body;
    const room = db.prepare('SELECT password FROM rooms WHERE id = ?').get(roomId);

    if (!room) {
      return res.status(404).json({ success: false, error: 'ไม่พบกระดานนี้' });
    }

    if (!room.password || room.password === '' || room.password === password) {
      return res.json({ success: true, verified: true });
    } else {
      return res.status(401).json({ success: false, verified: false, error: 'รหัสผ่านเข้ากระดานไม่ถูกต้อง' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new room (with optional password)
app.post('/api/rooms', (req, res) => {
  try {
    const { id, name, password } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุชื่อห้อง (Room name required)' });
    }
    const cleanId = (id || name).toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `room-${Date.now()}`;

    // Check if exists
    const existing = db.prepare('SELECT id FROM rooms WHERE id = ?').get(cleanId);
    if (existing) {
      return res.status(400).json({ success: false, error: 'มีห้องชื่อนี้หรือรหัสนี้อยู่แล้ว (Room ID already exists)' });
    }

    const roomPassword = password && password.trim() ? password.trim() : null;

    const stmt = db.prepare('INSERT INTO rooms (id, name, password) VALUES (?, ?, ?)');
    stmt.run(cleanId, name.trim(), roomPassword);

    const newRoom = {
      id: cleanId,
      name: name.trim(),
      is_protected: roomPassword ? 1 : 0,
      note_count: 0,
      created_at: new Date().toISOString()
    };
    broadcast({ type: 'ROOM_CREATED', room: newRoom });

    res.json({ success: true, room: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get notes for a room
app.get('/api/rooms/:roomId/notes', (req, res) => {
  try {
    const { roomId } = req.params;
    const room = db.prepare('SELECT password FROM rooms WHERE id = ?').get(roomId);

    // Check password protection
    if (room && room.password && room.password !== '') {
      const providedPassword = req.headers['x-room-password'] || req.query.password;
      if (providedPassword !== room.password) {
        return res.status(401).json({ success: false, is_protected: true, error: 'ต้องใช้รหัสผ่านในการเข้ากระดานนี้' });
      }
    }

    const notes = db.prepare('SELECT * FROM notes WHERE room_id = ? ORDER BY z_index ASC, created_at ASC').all(roomId);
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new note (supporting image_url)
app.post('/api/rooms/:roomId/notes', (req, res) => {
  try {
    const { roomId } = req.params;
    const { author_name, content, image_url, color, font_style, x_pos, y_pos } = req.body;

    if (!author_name || !author_name.trim()) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุชื่อผู้เขียน (Author name required)' });
    }
    if ((!content || !content.trim()) && (!image_url || !image_url.trim())) {
      return res.status(400).json({ success: false, error: 'กรุณาใส่ข้อความหรือแนบรูปภาพบน Post-it' });
    }

    // Get max z-index
    const maxZ = db.prepare('SELECT MAX(z_index) as maxZ FROM notes WHERE room_id = ?').get(roomId);
    const z_index = (maxZ && maxZ.maxZ ? maxZ.maxZ : 0) + 1;

    const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const noteColor = color || 'yellow';
    const font = font_style || 'sans';
    const x = typeof x_pos === 'number' ? x_pos : Math.floor(Math.random() * 300) + 100;
    const y = typeof y_pos === 'number' ? y_pos : Math.floor(Math.random() * 200) + 100;
    const image = image_url || null;

    const stmt = db.prepare(`
      INSERT INTO notes (id, room_id, author_name, content, image_url, color, font_style, x_pos, y_pos, z_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(noteId, roomId, author_name.trim(), (content || '').trim(), image, noteColor, font, x, y, z_index);

    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
    broadcast({ type: 'NOTE_CREATED', note: newNote });

    res.json({ success: true, note: newNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a note
app.put('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { content, image_url, color, font_style, x_pos, y_pos, z_index, pinned } = req.body;

    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบ Post-it นี้ (Note not found)' });
    }

    const updatedContent = content !== undefined ? content.trim() : existing.content;
    const updatedImage = image_url !== undefined ? image_url : existing.image_url;
    const updatedColor = color !== undefined ? color : existing.color;
    const updatedFont = font_style !== undefined ? font_style : existing.font_style;
    const updatedX = x_pos !== undefined ? x_pos : existing.x_pos;
    const updatedY = y_pos !== undefined ? y_pos : existing.y_pos;
    const updatedZ = z_index !== undefined ? z_index : existing.z_index;
    const updatedPinned = pinned !== undefined ? (pinned ? 1 : 0) : existing.pinned;

    const stmt = db.prepare(`
      UPDATE notes 
      SET content = ?, image_url = ?, color = ?, font_style = ?, x_pos = ?, y_pos = ?, z_index = ?, pinned = ?
      WHERE id = ?
    `);
    stmt.run(updatedContent, updatedImage, updatedColor, updatedFont, updatedX, updatedY, updatedZ, updatedPinned, id);

    const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    broadcast({ type: 'NOTE_UPDATED', note: updatedNote });

    res.json({ success: true, note: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle Like / Unlike a note
app.post('/api/notes/:id/toggle-like', (req, res) => {
  try {
    const { id } = req.params;
    const { liked } = req.body; // boolean: true = add like, false = remove like

    const note = db.prepare('SELECT likes FROM notes WHERE id = ?').get(id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'ไม่พบ Note' });
    }

    const newLikes = liked ? note.likes + 1 : Math.max(0, note.likes - 1);
    db.prepare('UPDATE notes SET likes = ? WHERE id = ?').run(newLikes, id);

    const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (updatedNote) {
      broadcast({ type: 'NOTE_UPDATED', note: updatedNote });
      res.json({ success: true, note: updatedNote });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'ไม่พบ Post-it นี้ (Note not found)' });
    }

    db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    broadcast({ type: 'NOTE_DELETED', noteId: id, roomId: note.room_id });

    res.json({ success: true, noteId: id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to Minimal Post-it Server' }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'DRAG_NOTE') {
        broadcast({ type: 'REALTIME_DRAG', noteId: data.noteId, x_pos: data.x_pos, y_pos: data.y_pos }, ws);
      }
    } catch (e) {
      console.error('WS Error:', e);
    }
  });
});

// Serve Vite Static Files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Vite Dev Server mode. Please access frontend dev server.');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Minimal Post-it Server running on http://localhost:${PORT}`);
});
