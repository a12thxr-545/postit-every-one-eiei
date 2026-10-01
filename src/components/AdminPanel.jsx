import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  LayoutGrid,
  StickyNote,
  Heart,
  Lock,
  Trash2,
  RefreshCw,
  Home,
  Eye,
  Key,
  Database,
  ExternalLink,
  Search,
  Sparkles,
  AlertTriangle,
  FileText,
  Check,
  Copy,
} from 'lucide-react';

export default function AdminPanel({
  onGoHome,
  onSelectRoom,
  addToast,
}) {
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'notes' | 'system'
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalNotes: 0,
    totalLikes: 0,
    protectedRooms: 0,
  });
  const [rooms, setRooms] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch full admin overview data
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
        setRooms(data.rooms);
        setNotes(data.notes);
      } else {
        console.error('Failed to fetch admin stats');
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Delete single room
  const handleDeleteRoom = async (roomId, roomName) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบห้อง "${roomName}" และ Post-it ทั้งหมดในห้องนี้?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/rooms/${roomId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast(`ลบห้อง "${roomName}" เรียบร้อยแล้ว`);
        fetchAdminData();
      } else {
        alert(data.error || 'ไม่สามารถลบห้องได้');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบห้อง');
    }
  };

  // Delete single note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบ Post-it แผ่นนี้?')) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('ลบ Post-it เรียบร้อยแล้ว');
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear ALL notes on site
  const handleClearAllNotes = async () => {
    if (!window.confirm('⚠️ คำเตือนสุดเสี่ยง: คุณแน่ใจหรือไม่ที่จะลบ Post-it "ทั้งหมดทุกแผ่น" บนเว็บไซต์นี้?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/clear-all-notes', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('ลบ Post-it ทั้งหมดบนเว็บไซต์เรียบร้อยแล้ว');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyAdminUrl = () => {
    const fullUrl = `${window.location.origin}/axthur545eiei`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    addToast('คัดลอกลิงก์ Admin URL เรียบร้อย');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (n.content && n.content.toLowerCase().includes(term)) ||
      (n.author_name && n.author_name.toLowerCase().includes(term)) ||
      (n.room_name && n.room_name.toLowerCase().includes(term))
    );
  });

  return (
    <div
      className="admin-container whiteboard-canvas"
      style={{
        minHeight: '100vh',
        padding: '24px 20px',
        overflowY: 'auto',
        touchAction: 'pan-y',
      }}
    >
      {/* Header Bar */}
      <header
        style={{
          maxWidth: 1200,
          margin: '0 auto 24px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          backgroundColor: 'var(--bg-card)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Super Admin Control Panel
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(236, 72, 153, 0.15)',
                  color: '#ec4899',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Super Admin Active
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Path: /axthur545eiei</span> • <span>จัดการระบบ กระดาน และ Post-it ทั้งหมด</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchAdminData}
            disabled={loading}
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>รีเฟรช</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={onGoHome}
          >
            <Home size={16} />
            <span>กลับหน้าหลัก</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Wrapper */}
      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Stat Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          {/* Card 1: Total Rooms */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutGrid size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ห้อง/กระดานทั้งหมด</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalRooms}</div>
            </div>
          </div>

          {/* Card 2: Total Post-its */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StickyNote size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Post-it ทั้งหมด</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalNotes}</div>
            </div>
          </div>

          {/* Card 3: Total Likes */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ยอดถูกใจรวม</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalLikes}</div>
            </div>
          </div>

          {/* Card 4: Protected Rooms */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ห้องล็อครหัสผ่าน</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.protectedRooms}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{
              backgroundColor: activeTab === 'rooms' ? 'var(--accent-light)' : 'transparent',
              borderColor: activeTab === 'rooms' ? 'var(--accent-color)' : 'var(--border-color)',
              color: activeTab === 'rooms' ? 'var(--accent-color)' : 'var(--text-primary)',
              fontWeight: 700,
            }}
            onClick={() => setActiveTab('rooms')}
          >
            <LayoutGrid size={16} />
            <span>จัดการห้อง ({rooms.length})</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{
              backgroundColor: activeTab === 'notes' ? 'var(--accent-light)' : 'transparent',
              borderColor: activeTab === 'notes' ? 'var(--accent-color)' : 'var(--border-color)',
              color: activeTab === 'notes' ? 'var(--accent-color)' : 'var(--text-primary)',
              fontWeight: 700,
            }}
            onClick={() => setActiveTab('notes')}
          >
            <StickyNote size={16} />
            <span>จัดการ Post-it ({notes.length})</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{
              backgroundColor: activeTab === 'system' ? 'var(--accent-light)' : 'transparent',
              borderColor: activeTab === 'system' ? 'var(--accent-color)' : 'var(--border-color)',
              color: activeTab === 'system' ? 'var(--accent-color)' : 'var(--text-primary)',
              fontWeight: 700,
            }}
            onClick={() => setActiveTab('system')}
          >
            <Key size={16} />
            <span>ความปลอดภัย & แอดมิน URL</span>
          </button>
        </div>

        {/* TAB 1: ROOMS MANAGEMENT */}
        {activeTab === 'rooms' && (
          <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                รายการกระดาน/ห้องทั้งหมดในระบบ
              </h3>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 16px' }}>ชื่อห้อง / ID</th>
                      <th style={{ padding: '12px 16px' }}>รหัสผ่าน</th>
                      <th style={{ padding: '12px 16px' }}>จำนวน Post-it</th>
                      <th style={{ padding: '12px 16px' }}>วันที่สร้าง</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{room.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: {room.id}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {room.password ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                              <Lock size={12} /> {room.password}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ไม่มีรหัสผ่าน</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                          {room.note_count || 0} แผ่น
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(room.created_at || Date.now()).toLocaleDateString('th-TH')}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                              onClick={() => onSelectRoom(room.id)}
                            >
                              <Eye size={14} /> เข้าดู
                            </button>

                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                              onClick={() => handleDeleteRoom(room.id, room.name)}
                            >
                              <Trash2 size={14} /> ลบห้อง
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POST-IT NOTES MANAGEMENT */}
        {activeTab === 'notes' && (
          <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
              <div className="search-box" style={{ width: 320 }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="ค้นหาข้อความ, คนแปะ หรือชื่อห้อง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ color: '#ef4444', borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                onClick={handleClearAllNotes}
              >
                <AlertTriangle size={16} /> ลบ Post-it ทั้งหมดบนเว็บไซต์
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 16px' }}>ข้อความ Post-it</th>
                      <th style={{ padding: '12px 16px' }}>คนแปะ (Author)</th>
                      <th style={{ padding: '12px 16px' }}>กระดาน (Room)</th>
                      <th style={{ padding: '12px 16px' }}>ถูกใจ</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                          ไม่พบ Post-it ที่ค้นหา
                        </td>
                      </tr>
                    ) : (
                      filteredNotes.map((note) => (
                        <tr key={note.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '14px 16px', maxWidth: 300 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className={`postit-${note.color || 'yellow'}`} style={{ width: 12, height: 12, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {note.content || '(แนบรูปภาพอย่างเดียว)'}
                              </span>
                            </div>
                            {note.image_url && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', marginTop: 2 }}>📷 มีแนบรูปภาพ</div>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                            {note.author_name || 'ไม่ระบุชื่อ'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontSize: '0.82rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', fontWeight: 600 }}>
                              {note.room_name || note.room_id}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#ef4444', fontWeight: 700 }}>
                            ❤️ {note.likes || 0}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 size={14} /> ลบ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN SECURITY & SYSTEM INFO */}
        {activeTab === 'system' && (
          <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={20} style={{ color: '#ec4899' }} />
                ลิงก์เข้าหน้า Super Admin
              </h3>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                คุณสามารถกดบันทึกหรือคัดลอกลิงก์ส่วนตัวนี้ เพื่อเข้าจัดการหน้าเว็บได้ตลอดเวลาจากทุกอุปกรณ์:
              </p>

              {/* URL Display Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-color)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 24,
                }}
              >
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/axthur545eiei`}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--accent-color)',
                    width: '100%',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCopyAdminUrl}
                  style={{ flexShrink: 0, padding: '7px 14px', fontSize: '0.85rem' }}
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedLink ? 'คัดลอกแล้ว' : 'คัดลอก URL'}</span>
                </button>
              </div>

              {/* Security info box */}
              <div style={{ padding: 16, backgroundColor: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, color: '#ec4899' }}>
                  <Sparkles size={16} /> สิทธิ์ Super Admin ครอบคลุมอะไรบ้าง?
                </div>
                <ul style={{ paddingLeft: 20, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  <li>สิทธิ์เข้าชม ลบ หรือแก้รหัสผ่านของทุกห้องบนเว็บไซต์</li>
                  <li>สิทธิ์ลบ Post-it ทุกแผ่นบนกระดาน หรือล้าง Post-it ทั้งหมดในคลิกเดียว</li>
                  <li>ไม่ต้องใส่รหัสผ่านใดๆ เมื่อเข้าผ่านเส้นทาง `/axthur545eiei`</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
