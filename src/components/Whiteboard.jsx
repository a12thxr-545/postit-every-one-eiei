import React, { useState } from 'react';
import { Search, StickyNote, Plus, Pin, Sparkles, X } from 'lucide-react';
import PostItNote from './PostItNote';

export default function Whiteboard({
  notes,
  activeRoom,
  currentUserName,
  isFreeform,
  onUpdateNote,
  onDeleteNote,
  onToggleLikeNote,
  onBringToFront,
  onStartDragNote,
  onDoubleClickBoard,
  onOpenCreateNote,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter((note) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (note.content && note.content.toLowerCase().includes(term)) ||
      (note.author_name && note.author_name.toLowerCase().includes(term))
    );
  });

  const handleDoubleClick = (e) => {
    if (e.target.classList.contains('whiteboard-canvas') || e.target.classList.contains('whiteboard-board-area')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollLeft = e.currentTarget.scrollLeft || 0;
      const scrollTop = e.currentTarget.scrollTop || 0;
      const x = Math.max(20, e.clientX - rect.left + scrollLeft - 120);
      const y = Math.max(20, e.clientY - rect.top + scrollTop - 80);
      onDoubleClickBoard(x, y);
    }
  };

  // Dynamically calculate board height based on lowest note position
  const maxNoteY = notes.reduce((max, note) => Math.max(max, (note.y_pos || 0) + 320), 700);

  return (
    <div className="whiteboard-canvas" onDoubleClick={handleDoubleClick}>
      {/* Sub-header Toolbar & Search Filter */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ค้นหาข้อความ หรือ ชื่อคนแปะ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Pin size={14} style={{ color: 'var(--accent-color)' }} /> ทั้งหมด {notes.length} แผ่น
          </span>
          {isFreeform && (
            <span className="desktop-only-hint" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={14} style={{ color: '#f59e0b' }} /> ดับเบิ้ลคลิกบนพื้นที่ว่างเพื่อวาง Post-it ใหม่ได้ทันที
            </span>
          )}
        </div>
      </div>

      {/* Main Board Container */}
      <div
        className={`whiteboard-board-area ${!isFreeform ? 'grid-container' : ''}`}
        style={{
          minHeight: isFreeform ? `${maxNoteY}px` : 'calc(100vh - 140px)',
          position: 'relative',
          paddingBottom: 200,
        }}
      >
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <StickyNote className="empty-icon" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              {searchTerm ? 'ไม่พบ Post-it ที่ค้นหา' : 'ยังไม่มี Post-it บนกระดานนี้'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              {searchTerm
                ? 'ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา'
                : 'มาร่วมสร้างสรรค์ไอเดียแรกด้วยการแปะ Post-it บนกระดานสีขาวนี้กันเลย'}
            </p>
            <button type="button" className="btn-primary" style={{ margin: '0 auto' }} onClick={onOpenCreateNote}>
              <Plus size={18} />
              เพิ่ม Post-it แผ่นแรก
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <PostItNote
              key={note.id}
              note={note}
              currentUserName={currentUserName}
              isFreeform={isFreeform}
              onUpdate={onUpdateNote}
              onDelete={onDeleteNote}
              onToggleLike={onToggleLikeNote}
              onBringToFront={onBringToFront}
              onStartDrag={onStartDragNote}
            />
          ))
        )}
      </div>
    </div>
  );
}
