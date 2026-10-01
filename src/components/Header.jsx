import React from 'react';
import { LayoutGrid, Plus, User, Moon, Sun, Grid, Move, Share2, Lock, ChevronDown, Home } from 'lucide-react';

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
      {/* Left Brand & Room Selector */}
      <div className="brand-section">
        {/* Home Button */}
        <button
          type="button"
          className="btn-icon"
          onClick={onGoHome}
          title="กลับไปยังหน้าหลัก (Home)"
          style={{ width: 38, height: 38 }}
        >
          <Home size={20} />
        </button>

        <div onClick={onGoHome} style={{ cursor: 'pointer' }}>
          <div className="brand-title">
            Minimal Board
            <span className="brand-badge">Whiteboard</span>
          </div>
        </div>

        {/* Room Switcher Pill */}
        <button
          type="button"
          className="room-selector-btn"
          onClick={onOpenRoomList}
          title="คลิกเพื่อเปลี่ยนกระดานหรือสลับห้อง"
        >
          <LayoutGrid size={16} style={{ color: 'var(--accent-color)' }} />
          <span>{activeRoom ? activeRoom.name : 'กำลังโหลด...'}</span>
          {activeRoom && activeRoom.is_protected === 1 && (
            <Lock size={12} style={{ color: '#f59e0b' }} title="กระดานนี้มีรหัสผ่าน" />
          )}
          <ChevronDown size={14} style={{ opacity: 0.6 }} />
        </button>
      </div>

      {/* Right Action Bar */}
      <div className="header-actions">
        {/* Layout Mode Toggle */}
        <button
          type="button"
          className="btn-secondary"
          onClick={onToggleLayout}
          title={isFreeform ? 'สลับเป็นโหมดจัดเรียงตาราง Grid' : 'สลับเป็นโหมดลากย้ายอิสระ Freeform'}
        >
          {isFreeform ? <Grid size={16} /> : <Move size={16} />}
          <span>{isFreeform ? 'โหมด Grid' : 'โหมด อิสระ'}</span>
        </button>

        {/* User Display Name Pill */}
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

        {/* Share Board Button */}
        <button
          type="button"
          className="btn-icon"
          onClick={onShareRoom}
          title="คัดลอกลิงก์แชร์กระดานนี้"
        >
          <Share2 size={18} />
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleTheme}
          title={isDarkMode ? 'สลับเป็น Theme สว่าง' : 'สลับเป็น Theme มืด'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Create Room Button */}
        <button
          type="button"
          className="btn-secondary"
          onClick={onOpenCreateRoom}
        >
          <Plus size={16} />
          กระดานใหม่
        </button>

        {/* Write Note Primary Button */}
        <button
          type="button"
          className="btn-primary"
          onClick={onOpenCreateNote}
        >
          <Plus size={18} />
          เขียน Post-it
        </button>
      </div>
    </header>
  );
}
