import React, { useState } from 'react';
import { ArrowRight, User, Sparkles, LayoutGrid, Plus, Lock, FileText, ChevronRight } from 'lucide-react';

export default function HomePage({
  rooms,
  userName,
  onSelectRoom,
  onOpenCreateRoom,
  onOpenEditName,
}) {
  const [showRoomSelection, setShowRoomSelection] = useState(false);

  return (
    <div
      className="home-page-container whiteboard-canvas"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 20px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header - No Logo as requested */}
      <header
        style={{
          width: '100%',
          maxWidth: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '12px 0',
        }}
      >
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
      </header>

      {/* Main Content Area */}
      {!showRoomSelection ? (
        /* Step 1: Stacked Post-it Animation Screen */
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto 0',
            cursor: 'pointer',
          }}
          onClick={() => setShowRoomSelection(true)}
        >
          {/* Stacked Post-it Container */}
          <div className="postit-stack-container" title="คลิกเพื่อเลือกห้องและเข้าสู่กระดาน">
            {/* Stacked Layer 3 (Bottom) */}
            <div className="postit-stack-layer layer-bottom" />

            {/* Stacked Layer 2 (Middle) */}
            <div className="postit-stack-layer layer-middle" />

            {/* Stacked Layer 1 (Top Post-it with text) */}
            <div className="postit-stack-layer layer-top">
              {/* Tape Decorator */}
              <div className="postit-tape" style={{ width: 85, height: 24, top: -12 }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.75, marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Minimal Board</span>
                <span style={{ fontSize: '0.72rem' }}>Click to continue</span>
              </div>

              {/* Text: write to postit */}
              <div
                style={{
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: 'clamp(2.4rem, 5.5vw, 3.6rem)',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: '#713f12',
                  textAlign: 'center',
                  margin: '20px 0 28px 0',
                }}
              >
                write to postit
              </div>

              {/* Action Hint Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#713f12',
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(113, 63, 18, 0.12)',
                }}
              >
                <span>กดเพื่อเลือกกระดาน</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 32,
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />
            คลิกที่ Post-it เพื่อเลือกห้องและเริ่มแปะข้อความ
          </div>
        </main>
      ) : (
        /* Step 2: Select Room Screen */
        <main
          style={{
            maxWidth: 860,
            width: '100%',
            margin: 'auto 0',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <LayoutGrid size={26} style={{ color: 'var(--accent-color)' }} />
              เลือกกระดาน / ห้องที่ต้องการเข้า
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              คลิกเลือกห้องเพื่อเข้าสู่กระดานแปะ Post-it หรือกดสร้างกระดานใหม่
            </p>
          </div>

          {/* Rooms Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
              marginBottom: 28,
            }}
          >
            {rooms.map((room) => {
              const isProtected = room.is_protected === 1;
              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px 18px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  className="room-selection-card"
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {room.name}
                      {isProtected && <Lock size={12} style={{ color: '#f59e0b' }} title="มีรหัสผ่าน" />}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={12} />
                      {room.note_count || 0} Post-it แปะอยู่
                    </div>
                  </div>

                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ChevronRight size={18} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowRoomSelection(false)}
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenCreateRoom}
            >
              <Plus size={16} />
              สร้างกระดานใหม่
            </button>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 8 }}>
        Minimal Post-it Board • Real-time Collaboration
      </footer>
    </div>
  );
}
