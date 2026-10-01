import React from 'react';
import { StickyNote, ArrowRight, User, Sparkles, PenTool } from 'lucide-react';

export default function HomePage({
  userName,
  onEnterBoard,
  onOpenEditName,
  isDarkMode,
  onToggleTheme,
}) {
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
      {/* Home Header Navbar */}
      <header className="app-header" style={{ width: '100%', maxWidth: 1100, borderRadius: 'var(--radius-full)' }}>
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

      {/* Main Animated Post-it Section */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto 0',
          cursor: 'pointer',
        }}
        onClick={onEnterBoard}
      >
        {/* Animated Hero Post-it Note Card */}
        <div className="animated-hero-postit" title="คลิกเพื่อเริ่มเขียน Post-it บนกระดาน">
          {/* Tape Decorator */}
          <div className="postit-tape" style={{ width: 90, height: 26, top: -14 }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.8, marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <PenTool size={14} /> Minimal Note
            </span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Click to enter</span>
          </div>

          {/* Main Requested Text: write to postit */}
          <div
            className="hero-postit-text"
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: 'clamp(2.5rem, 6vw, 3.8rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: '#713f12',
              textAlign: 'center',
              margin: '24px 0 32px 0',
              textShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            write to postit
          </div>

          {/* Call-to-action bar on bottom of note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#713f12',
              backgroundColor: 'rgba(255, 255, 255, 0.55)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(113, 63, 18, 0.15)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>เข้าสู่กระดานไวท์บอร์ด</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Subtitle Hint */}
        <div
          style={{
            marginTop: 28,
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 600,
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />
          คลิกที่ Post-it หรือปุ่มด้านบนเพื่อเริ่มเขียนข้อความ
        </div>
      </main>

      {/* Footer minimal info */}
      <footer style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 8 }}>
        Minimal Post-it Board • Real-time Collaboration
      </footer>
    </div>
  );
}
