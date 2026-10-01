import React, { useState } from 'react';
import { StickyNote, Plus, ArrowRight, LayoutGrid, Lock, User, FileText, Sparkles, Shield, Image as ImageIcon, Zap } from 'lucide-react';

export default function HomePage({
  rooms,
  userName,
  onSelectRoom,
  onOpenCreateRoom,
  onOpenEditName,
  isDarkMode,
  onToggleTheme,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-page-container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Home Header */}
      <header className="app-header" style={{ maxWidth: 1200, margin: '0 auto', borderRadius: '0 0 16px 16px' }}>
        <div className="brand-section">
          <div className="brand-logo">
            <StickyNote size={22} />
          </div>
          <div className="brand-title">
            Minimal Board
            <span className="brand-badge">Whiteboard</span>
          </div>
        </div>

        <div className="header-actions">
          {/* User Badge Pill */}
          <button
            type="button"
            className="user-badge-btn"
            onClick={onOpenEditName}
            title="คลิกเพื่อเปลี่ยนชื่อของคุณ"
          >
            <div className="user-avatar">
              {(userName || 'U').charAt(0).toUpperCase()}
            </div>
            <span>คุณ: {userName || 'ไม่ระบุชื่อ'}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-color)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            <Sparkles size={16} /> พื้นที่แชร์ไอเดียและแปะ Post-it สไตล์มินิมอล
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            กระดานไวท์บอร์ดสีขาว
            <br />
            <span style={{ color: 'var(--accent-color)' }}>สร้างสรรค์ไอเดียร่วมกันแบบ Real-time</span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              maxWidth: 620,
              margin: '0 auto 32px auto',
              lineHeight: 1.6,
            }}
          >
            เลือกกระดานที่คุณต้องการเข้าใช้งาน หรือสร้างห้องใหม่ได้ทันที แปะข้อความ โน้ตลายมือ หรือแนบรูปภาพ ได้อย่างอิสระ
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '1rem' }}
              onClick={() => onSelectRoom('general')}
            >
              เข้าสู่กระดานทั่วไป (General)
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '12px 24px', fontSize: '1rem' }}
              onClick={onOpenCreateRoom}
            >
              <Plus size={18} />
              สร้างกระดานใหม่
            </button>
          </div>
        </div>

        {/* Board Selection Grid Section */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LayoutGrid size={22} style={{ color: 'var(--accent-color)' }} />
                เลือกกระดานที่ต้องการเข้าใช้งาน
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 2 }}>
                มีทั้งหมด {rooms.length} กระดานพร้อมใช้งาน
              </p>
            </div>

            <button type="button" className="btn-secondary" onClick={onOpenCreateRoom}>
              <Plus size={16} />
              สร้างกระดานใหม่
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {filteredRooms.map((room) => {
              const isProtected = room.is_protected === 1;
              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px 20px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  className="home-board-card"
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      backgroundColor: isProtected ? '#f59e0b' : 'var(--accent-color)',
                    }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isProtected ? 'rgba(245, 158, 11, 0.15)' : 'var(--accent-light)',
                          color: isProtected ? '#d97706' : 'var(--accent-color)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {isProtected ? <Lock size={12} /> : <Sparkles size={12} />}
                        {isProtected ? 'มีรหัสผ่าน' : 'สาธารณะ'}
                      </span>

                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={14} />
                        {room.note_count || 0} Post-it
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      {room.name}
                    </h3>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 24,
                      paddingTop: 14,
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--accent-color)',
                    }}
                  >
                    <span>เข้าสู่กระดาน</span>
                    <ArrowRight size={18} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            paddingTop: 30,
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div style={{ padding: 20, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Zap size={20} />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>Real-time Live Sync</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              ทุกคนบนกระดานเดียวกันมองเห็นการเพิ่ม แปะ หรือลากย้าย Post-it ได้ทันทีแบบสดๆ
            </p>
          </div>

          <div style={{ padding: 20, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <ImageIcon size={20} />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>แนบรูปภาพประกอบ</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              อัปโหลดไฟล์รูปภาพหรือวาง Image URL ลงบนแผ่น Post-it ได้ง่ายและย่อขนาดให้อัตโนมัติ
            </p>
          </div>

          <div style={{ padding: 20, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Shield size={20} />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>ล็อกรหัสผ่านห้องได้</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              สร้างห้องแบบเปิดสาธารณะ หรือตั้งรหัสผ่านล็อกห้องเพื่อความเป็นส่วนตัวได้ตามต้องการ
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
