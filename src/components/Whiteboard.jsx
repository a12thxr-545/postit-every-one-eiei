import React, { useState, useRef, useEffect } from 'react';
import { Search, StickyNote, Plus, Pin, Sparkles, X, Focus, RefreshCw } from 'lucide-react';
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
  onViewNote,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const canvasRef = useRef(null);

  const filteredNotes = notes.filter((note) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (note.content && note.content.toLowerCase().includes(term)) ||
      (note.author_name && note.author_name.toLowerCase().includes(term))
    );
  });

  // Calculate dynamic canvas dimensions to fit all notes (including far right/bottom notes dragged on PC/iPad)
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const maxNoteX = notes.reduce((max, note) => Math.max(max, (note.x_pos || 0) + 340), isFreeform ? Math.max(1200, windowWidth + 200) : 0);
  const maxNoteY = notes.reduce((max, note) => Math.max(max, (note.y_pos || 0) + 380), 750);

  // Check if any notes are placed far outside standard visible screen bounds
  const outOfBoundsNotes = notes.filter(
    (note) => (note.x_pos || 0) > Math.max(340, windowWidth - 100) || (note.y_pos || 0) > 1200
  );

  // Listen for Escape key to clear search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm]);

  // Auto-scroll to first matching search result
  useEffect(() => {
    if (!searchTerm.trim() || filteredNotes.length === 0 || !isFreeform) return;
    const firstMatch = filteredNotes[0];
    if (firstMatch && canvasRef.current) {
      const scrollX = Math.max(0, (firstMatch.x_pos || 0) - 40);
      const scrollY = Math.max(0, (firstMatch.y_pos || 0) - 80);
      canvasRef.current.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth',
      });
    }
  }, [searchTerm, isFreeform]);

  // Pull notes back into standard viewport bounds if user clicks reset button
  const handleResetNotesToBounds = () => {
    const maxX = Math.max(20, windowWidth - 260);
    notes.forEach((note, index) => {
      if ((note.x_pos || 0) > maxX || (note.y_pos || 0) > 800) {
        const safeX = Math.min(note.x_pos || 0, Math.max(20, (index % 4) * 230 + 20));
        const safeY = Math.min(note.y_pos || 0, Math.max(60, Math.floor(index / 4) * 200 + 80));
        onUpdateNote(note.id, { x_pos: safeX, y_pos: safeY });
      }
    });
  };

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

  return (
    <div className="whiteboard-canvas" ref={canvasRef} onDoubleClick={handleDoubleClick}>
      {/* Sub-header Toolbar & Search Filter */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ค้นหาข้อความ หรือ ชื่อคนแปะ... (Esc เพื่อล้าง)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6 }}
              title="ล้างการค้นหา"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-info-group">
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <Pin size={14} style={{ color: 'var(--accent-color)' }} />
            {searchTerm ? `พบ ${filteredNotes.length} จาก ${notes.length} แผ่น` : `ทั้งหมด ${notes.length} แผ่น`}
          </span>

          {searchTerm && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSearchTerm('')}
              style={{ padding: '3px 10px', fontSize: '0.78rem', gap: 4 }}
            >
              <X size={13} /> ล้างการค้นหา
            </button>
          )}

          {/* Reset Out-of-bounds Notes Helper Button */}
          {outOfBoundsNotes.length > 0 && isFreeform && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetNotesToBounds}
              style={{ padding: '4px 10px', fontSize: '0.78rem', gap: 6, borderRadius: 'var(--radius-full)' }}
              title="ดึง Post-it ที่อยู่ไกลเกินขอบจอกลับมาในหน้าจอ"
            >
              <RefreshCw size={13} style={{ color: '#f59e0b' }} />
              <span>ดึง Post-it ที่หลุดขอบกลับมา ({outOfBoundsNotes.length})</span>
            </button>
          )}

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
          minWidth: isFreeform ? `${maxNoteX}px` : '100%',
          minHeight: isFreeform ? `${maxNoteY}px` : 'calc(100vh - 140px)',
          position: 'relative',
          paddingBottom: 200,
          paddingRight: isFreeform ? 200 : 0,
        }}
      >
        {notes.length === 0 ? (
          <div className="empty-state">
            <StickyNote className="empty-icon" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              ยังไม่มี Post-it บนกระดานนี้
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              มาร่วมสร้างสรรค์ไอเดียแรกด้วยการแปะ Post-it บนกระดานสีขาวนี้กันเลย
            </p>
            <button type="button" className="btn-primary" style={{ margin: '0 auto' }} onClick={onOpenCreateNote}>
              <Plus size={18} />
              เพิ่ม Post-it แผ่นแรก
            </button>
          </div>
        ) : searchTerm.trim() && filteredNotes.length === 0 ? (
          <div className="empty-state">
            <StickyNote className="empty-icon" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              ไม่พบ Post-it ที่ตรงกับ "{searchTerm}"
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              ลองค้นหาด้วยชื่อหรือข้อความอื่น หรือกดล้างการค้นหา
            </p>
            <button type="button" className="btn-secondary" style={{ margin: '0 auto' }} onClick={() => setSearchTerm('')}>
              <X size={16} />
              ล้างการค้นหา
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <PostItNote
              key={note.id}
              note={note}
              currentUserName={currentUserName}
              isFreeform={isFreeform}
              searchTerm={searchTerm}
              onUpdate={onUpdateNote}
              onDelete={onDeleteNote}
              onToggleLike={onToggleLikeNote}
              onBringToFront={onBringToFront}
              onStartDrag={onStartDragNote}
              onViewNote={onViewNote}
            />
          ))
        )}
      </div>
    </div>
  );
}

