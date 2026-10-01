import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Grid,
  Move,
  Share2,
  Lock,
  ChevronRight,
  Home,
  Menu,
  X,
  FolderPlus,
  LayoutGrid,
} from 'lucide-react';

export default function Header({
  activeRoom,
  userName,
  isDarkMode,
  isFreeform,
  searchTerm,
  setSearchTerm,
  onOpenRoomList,
  onOpenCreateRoom,
  onOpenCreateNote,
  onOpenEditName,
  onToggleTheme,
  onToggleLayout,
  onShareRoom,
  onGoHome,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close burger menu on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="app-header">
      {/* Left: Brand / Home & Room Title */}
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
          <span className="brand-title-text" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            {activeRoom ? activeRoom.name : 'Post-it'}
          </span>
          {activeRoom && activeRoom.is_protected === 1 && (
            <Lock size={13} style={{ color: '#f59e0b', flexShrink: 0 }} title="กระดานนี้มีรหัสผ่าน" />
          )}
        </div>
      </div>

      {/* Center: Search Bar in Navbar */}
      <div className="header-search-container">
        <div className="search-box header-search-box">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ค้นหาข้อความ หรือ คนแปะ... (Esc)"
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6, padding: 2 }}
              title="ล้างการค้นหา"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions & Burger Menu */}
      <div className="header-actions">
        {/* Write Post-it Primary Button */}
        <button
          type="button"
          className="btn-primary header-write-btn"
          onClick={onOpenCreateNote}
        >
          <Plus size={16} />
          <span className="btn-label">เขียน Post-it</span>
        </button>

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

        {/* Burger Menu Bar Container */}
        <div className="burger-menu-container" ref={menuRef}>
          <button
            type="button"
            className={`btn-icon header-tool-icon burger-trigger-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="เมนูตั้งค่าและเครื่องมือ"
            aria-label="เมนู"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Burger Dropdown Menu */}
          {isMenuOpen && (
            <div className="burger-menu-dropdown">
              {/* Room Selector Item */}
              <button
                type="button"
                className="burger-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenRoomList();
                }}
              >
                <LayoutGrid size={17} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    สลับห้อง / กระดาน
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ปัจจุบัน: {activeRoom ? activeRoom.name : 'ทั่วไป'}
                  </span>
                </div>
                <ChevronRight size={15} style={{ opacity: 0.5, flexShrink: 0 }} />
              </button>

              <div className="burger-menu-divider" />

              {/* User Profile / Change Name */}
              <button
                type="button"
                className="burger-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenEditName();
                }}
              >
                <div className="user-avatar" style={{ width: 26, height: 26, fontSize: '0.75rem', flexShrink: 0 }}>
                  {(userName || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    คุณ: {userName || 'ผู้ใช้'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>คลิกเพื่อเปลี่ยนชื่อ</span>
                </div>
              </button>

              <div className="burger-menu-divider" />

              {/* Share Room Button */}
              <button
                type="button"
                className="burger-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  onShareRoom();
                }}
              >
                <Share2 size={17} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                <span>แชร์ลิงก์กระดานนี้</span>
              </button>

              {/* Toggle Theme Button */}
              <button
                type="button"
                className="burger-menu-item"
                onClick={() => {
                  onToggleTheme();
                }}
              >
                {isDarkMode ? (
                  <Sun size={17} style={{ color: '#f59e0b', flexShrink: 0 }} />
                ) : (
                  <Moon size={17} style={{ color: '#6366f1', flexShrink: 0 }} />
                )}
                <span>{isDarkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}</span>
              </button>

              <div className="burger-menu-divider" />

              {/* Create New Room Button */}
              <button
                type="button"
                className="burger-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenCreateRoom();
                }}
              >
                <FolderPlus size={17} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>สร้างกระดานใหม่</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
