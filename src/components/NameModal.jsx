import React, { useState } from 'react';
import { User, Check, X } from 'lucide-react';

export default function NameModal({ currentName, onSave, isMandatory, onClose }) {
  const [nameInput, setNameInput] = useState(currentName || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('กรุณาพิมพ์ชื่อของคุณ (Please enter your name)');
      return;
    }
    onSave(nameInput.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '1rem' }}>
              <User size={18} />
            </div>
            {isMandatory ? 'ยินดีต้อนรับสู่ Minimal Post-it' : 'ตั้งค่าชื่อของคุณ'}
          </div>
          {!isMandatory && (
            <button type="button" className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, lineHeight: 1.5 }}>
            {isMandatory
              ? 'กรุณาใส่ชื่อของคุณก่อนเริ่มใช้งาน ชื่อนี้จะแสดงบน Post-it ทุกแผ่นที่คุณแปะลงบนกระดาน'
              : 'ชื่อนี้จะถูกแปะไว้ที่มุมบนของ Post-it ที่คุณสร้างขึ้น'}
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="user-name-input">
              ชื่อของคุณ (Display Name)
            </label>
            <input
              id="user-name-input"
              type="text"
              className="form-input"
              placeholder="เช่น น้องมินิมอล, Arthur, Designer Girl..."
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setError('');
              }}
              autoFocus
              maxLength={30}
            />
            {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6, display: 'block' }}>{error}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            {!isMandatory && (
              <button type="button" className="btn-secondary" onClick={onClose}>
                ยกเลิก
              </button>
            )}
            <button type="submit" className="btn-primary">
              <Check size={16} />
              บันทึกชื่อ & เข้าสู่กระดาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
