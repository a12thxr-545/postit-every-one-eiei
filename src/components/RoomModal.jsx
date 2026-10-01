import React, { useState } from 'react';
import { PlusCircle, LayoutGrid, Lock, Unlock, Key, X } from 'lucide-react';

export default function RoomModal({ onCreateRoom, onClose }) {
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('กรุณาใส่ชื่อกระดานหรือห้องใหม่ (Board name required)');
      return;
    }
    onCreateRoom(roomName.trim(), isProtected ? password.trim() : null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <LayoutGrid size={22} style={{ color: 'var(--accent-color)' }} />
            สร้างกระดานใหม่ (Create New Board)
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="room-name-input">
              ชื่อกระดาน / ชื่อห้อง (Board Title)
            </label>
            <input
              id="room-name-input"
              type="text"
              className="form-input"
              placeholder="เช่น ไอเดียทำแอป 2026, สรุปการประชุม..."
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                setError('');
              }}
              autoFocus
              maxLength={50}
            />
            {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6, display: 'block' }}>{error}</span>}
          </div>

          {/* Optional Password Option */}
          <div className="form-group" style={{ marginTop: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
              onClick={() => setIsProtected(!isProtected)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isProtected ? (
                  <Lock size={18} style={{ color: 'var(--accent-color)' }} />
                ) : (
                  <Unlock size={18} style={{ color: 'var(--text-muted)' }} />
                )}
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isProtected ? 'ตั้งรหัสผ่านล็อกกระดาน' : 'ไม่ตั้งรหัสผ่าน (เปิดสาธารณะ)'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {isProtected ? 'ผู้ที่จะเข้าต้องใส่รหัสผ่าน' : 'ทุกคนสามารถเข้ามาได้ทันที'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isProtected}
                onChange={(e) => setIsProtected(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>
          </div>

          {isProtected && (
            <div className="form-group">
              <label className="form-label" htmlFor="room-password-input">
                <Key size={14} style={{ display: 'inline', marginRight: 4 }} />
                กำหนดรหัสผ่านกระดาน
              </label>
              <input
                id="room-password-input"
                type="password"
                className="form-input"
                placeholder="กรอกรหัสผ่านสำหรับห้องนี้..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} />
              สร้างกระดาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
