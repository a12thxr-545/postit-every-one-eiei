import React from 'react';
import { LayoutGrid, Plus, Moon, Sun, Grid, Move, Share2, Lock, ChevronDown, Home } from 'lucide-react';

export default function Header({
  activeRoom,
  userName,
  isDarkMode,
  isFreeform,
  onOpenRoomList,
  onOpenCreateRoom,
  onOpenCreateNote,
  onOpenEditName,
  onToggleTheme,
  onToggleLayout,
  onShareRoom,
  onGoHome,
}) {
  return (
    <header className="app-header">
      {/* Brand & Room Switcher */}
      <div className="brand-section">
        <button
          type="button"
          className="btn-icon header-home-btn"
          onClick={onGoHome}
          title="หน้าหลัก"
        >
          <Home size={18} />
        </button>

        <div className="brand-title-group" onClick={onGoHome} title="หน้าหลัก">
          <span className="brand-title-text">Minimal Board</span>
        </div>

        <button
          type="button"
          className="room-selector-btn"
          onClick={onOpenRoomList}
          title="สลับห้อง/กระดาน"
        >
          <LayoutGrid size={15} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
          <span className="room-selector-name">{activeRoom ? activeRoom.name : 'กำลังโหลด...'}</span>
          {activeRoom && activeRoom.is_protected === 1 && (
            <Lock size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
          )}
          <ChevronDown size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
        </button>
      </div>

      {/* Control Actions */}
      <div className="header-actions">
        {/* Layout Switcher (Grid/Freeform) */}
        <button
          type="button"
          className="btn-secondary header-pill-btn"
          onClick={onToggleLayout}
          title={isFreeform ? 'สลับเป็น Grid' : 'สลับเป็น อิสระ'}
        >
          {isFreeform ? <Grid size={15} /> : <Move size={15} />}
          <span className="btn-label">{isFreeform ? 'Grid' : 'อิสระ'}</span>
        </button>

        {/* User Badge */}
        <button
          type="button"
          className="user-badge-btn"
          onClick={onOpenEditName}
          title="เปลี่ยนชื่อ"
        >
          <div className="user-avatar">
            {(userName || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="user-badge-name">คุณ: {userName || 'ผู้ใช้'}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          className="btn-icon header-tool-icon"
          onClick={onShareRoom}
          title="แชร์ลิงก์"
        >
          <Share2 size={16} />
        </button>

        {/* Theme Button */}
        <button
          type="button"
          className="btn-icon header-tool-icon"
          onClick={onToggleTheme}
          title="เปลี่ยนธีม"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Create Room Button (Secondary) */}
        <button
          type="button"
          className="btn-secondary header-pill-btn header-add-room-btn"
          onClick={onOpenCreateRoom}
          title="สร้างกระดานใหม่"
        >
          <Plus size={15} />
          <span className="btn-label">สร้างห้อง</span>
        </button>

        {/* Write Post-it Primary Button */}
        <button
          type="button"
          className="btn-primary header-write-btn"
          onClick={onOpenCreateNote}
        >
          <Plus size={16} />
          <span className="btn-label">เขียน Post-it</span>
        </button>
      </div>
    </header>
  );
}

