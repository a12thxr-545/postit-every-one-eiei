import React, { useState } from 'react';
import { Lock, Key, ArrowRight } from 'lucide-react';

export default function PasswordModal({ roomName, onVerify, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('กรุณาใส่รหัสผ่านเพื่อเข้ากระดานนี้');
      return;
    }
    onVerify(password.trim(), setError);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div className="modal-title">
            <Lock size={22} style={{ color: 'var(--accent-color)' }} />
            กระดานนี้มีการป้องกันด้วยรหัสผ่าน
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 18, lineHeight: 1.5 }}>
            กรุณากรอกรหัสผ่านเพื่อเข้าสู่กระดาน <strong>"{roomName}"</strong>
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="room-password-input">
              <Key size={14} style={{ display: 'inline', marginRight: 4 }} />
              รหัสผ่านกระดาน (Board Password)
            </label>
            <input
              id="room-password-input"
              type="password"
              className="form-input"
              placeholder="กรอกรหัสผ่าน..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoFocus
            />
            {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6, display: 'block' }}>{error}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary">
              <ArrowRight size={16} />
              ยืนยันรหัสผ่าน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
