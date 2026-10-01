import React from 'react';
import { LayoutGrid, Plus, ArrowRight, FileText, Lock, Unlock, X } from 'lucide-react';

export default function RoomListModal({ rooms, activeRoomId, onSelectRoom, onOpenCreateRoom, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div className="modal-title">
            <LayoutGrid size={22} style={{ color: 'var(--accent-color)' }} />
            เลือกกระดาน / ห้องทั้งหมด (All Boards)
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4, marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rooms.map((room) => {
              const isActive = room.id === activeRoomId;
              const isProtected = room.is_protected === 1;

              return (
                <div
                  key={room.id}
                  onClick={() => {
                    onSelectRoom(room.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--accent-light)' : 'var(--bg-canvas)',
                    border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="room-item-row"
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: isActive ? 'var(--accent-color)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {room.name}
                      {isProtected && (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12, backgroundColor: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Lock size={10} /> มีรหัสผ่าน
                        </span>
                      )}
                      {isActive && (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12, backgroundColor: 'var(--accent-color)', color: '#fff' }}>
                          กำลังใช้งาน
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={12} />
                      {room.note_count || 0} Post-it แปะอยู่
                    </div>
                  </div>
                  <ArrowRight size={18} style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-muted)' }} />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            มีทั้งหมด {rooms.length} กระดาน
          </span>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onClose();
              onOpenCreateRoom();
            }}
          >
            <Plus size={16} />
            สร้างกระดานใหม่
          </button>
        </div>
      </div>
    </div>
  );
}
