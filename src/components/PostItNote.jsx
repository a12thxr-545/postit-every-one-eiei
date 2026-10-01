import React, { useState, useRef, useEffect } from 'react';
import { Heart, Trash2, Palette, X, Maximize2 } from 'lucide-react';

const COLORS = ['yellow', 'peach', 'green', 'blue', 'purple', 'pink', 'white'];

function getRotationAngle(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const deg = (hash % 7) - 3;
  return deg === 0 ? -1 : deg;
}

export default function PostItNote({
  note,
  currentUserName,
  onUpdate,
  onDelete,
  onToggleLike,
  onBringToFront,
  isFreeform,
  onStartDrag,
  onViewNote,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Track liked state from localStorage
  const [isLiked, setIsLiked] = useState(() => {
    try {
      const likedNotes = JSON.parse(localStorage.getItem('liked_notes') || '[]');
      return likedNotes.includes(note.id);
    } catch (e) {
      return false;
    }
  });

  const noteRef = useRef(null);
  const rotation = useRef(getRotationAngle(note.id));

  // Toggle Like / Unlike handler
  const handleLikeClick = (e) => {
    e.stopPropagation();
    try {
      const likedNotes = JSON.parse(localStorage.getItem('liked_notes') || '[]');
      let updatedLikedNotes;
      let newLikedState;

      if (isLiked) {
        // Unlike
        updatedLikedNotes = likedNotes.filter((id) => id !== note.id);
        newLikedState = false;
      } else {
        // Like
        updatedLikedNotes = [...likedNotes, note.id];
        newLikedState = true;
      }

      localStorage.setItem('liked_notes', JSON.stringify(updatedLikedNotes));
      setIsLiked(newLikedState);
      onToggleLike(note.id, newLikedState);
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  // Handle Mouse / Touch Dragging
  const handleMouseDown = (e) => {
    if (!isFreeform) return;
    if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('.no-drag')) {
      return;
    }

    onBringToFront(note.id);
    setIsDragging(true);

    const rect = noteRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTouchStart = (e) => {
    if (!isFreeform) return;
    if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('.no-drag')) {
      return;
    }

    onBringToFront(note.id);
    const touch = e.touches[0];
    const rect = noteRef.current.getBoundingClientRect();
    
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const canvas = document.querySelector('.whiteboard-canvas');
      const canvasRect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
      const scrollLeft = canvas ? canvas.scrollLeft : 0;
      const scrollTop = canvas ? canvas.scrollTop : 0;

      const noteWidth = noteRef.current ? noteRef.current.offsetWidth : (window.innerWidth <= 640 ? 215 : 270);
      const maxAllowedX = Math.max(10, (window.innerWidth || 360) - noteWidth - 12);
      const newX = Math.min(maxAllowedX, Math.max(10, e.clientX - canvasRect.left + scrollLeft - dragOffset.x));
      const newY = Math.max(10, e.clientY - canvasRect.top + scrollTop - dragOffset.y);

      onStartDrag(note.id, newX, newY);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const canvas = document.querySelector('.whiteboard-canvas');
        const canvasRect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
        const scrollLeft = canvas ? canvas.scrollLeft : 0;
        const scrollTop = canvas ? canvas.scrollTop : 0;

        const noteWidth = noteRef.current ? noteRef.current.offsetWidth : (window.innerWidth <= 640 ? 215 : 270);
        const maxAllowedX = Math.max(10, (window.innerWidth || 360) - noteWidth - 12);
        const newX = Math.min(maxAllowedX, Math.max(10, touch.clientX - canvasRect.left + scrollLeft - dragOffset.x));
        const newY = Math.max(10, touch.clientY - canvasRect.top + scrollTop - dragOffset.y);

        onStartDrag(note.id, newX, newY);
      }
    };

    const handleDragEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        onUpdate(note.id, { x_pos: note.x_pos, y_pos: note.y_pos });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging, dragOffset, note.id, note.x_pos, note.y_pos, onStartDrag, onUpdate]);

  const formattedTime = new Date(note.created_at || Date.now()).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const cardWidth = typeof window !== 'undefined' && window.innerWidth <= 640 ? 215 : 240;

  return (
    <div
      ref={noteRef}
      className={`postit-card postit-${note.color || 'yellow'} font-${note.font_style || 'sans'}`}
      style={
        isFreeform
          ? {
              left: `min(${Math.max(10, note.x_pos || 10)}px, calc(100vw - ${cardWidth + 14}px))`,
              top: `${Math.max(10, note.y_pos || 10)}px`,
              zIndex: note.z_index || 1,
              transform: isDragging ? 'scale(1.04) rotate(0deg)' : `rotate(${rotation.current}deg)`,
            }
          : {
              transform: `rotate(${rotation.current}deg)`,
            }
      }
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={() => onBringToFront(note.id)}
    >
      {/* Tape Decorator */}
      <div className="postit-tape" />

      {/* Note Header */}
      <div className="postit-header">
        <div className="postit-author">
          <div className="postit-author-avatar">
            {(note.author_name || 'U').charAt(0).toUpperCase()}
          </div>
          <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.author_name || 'ไม่ระบุชื่อ'}
          </span>
        </div>
        <span className="postit-time">{formattedTime}</span>
      </div>

      {/* Optional Attached Image */}
      {note.image_url && (
        <div
          style={{ marginBottom: 8, borderRadius: 4, overflow: 'hidden', cursor: 'pointer' }}
          className="no-drag"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewNote) onViewNote(note);
          }}
          title="คลิกเพื่อขยายดู Post-it แบบขยายใหญ่"
        >
          <img
            src={note.image_url}
            alt="Attached"
            style={{
              width: '100%',
              maxHeight: 140,
              objectFit: 'cover',
              borderRadius: 4,
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Note Body Text */}
      <div
        className="postit-body"
        onClick={(e) => {
          // If in grid mode or user single clicks text area
          if (!isFreeform && onViewNote) {
            onViewNote(note);
          }
        }}
      >
        {note.content}
      </div>

      {/* Footer & Toolbar */}
      <div className="postit-footer">
        <button
          type="button"
          className="postit-like-btn no-drag"
          onClick={handleLikeClick}
          title={isLiked ? 'ยกเลิกถูกใจ (Unlike)' : 'กดถูกใจ (Like)'}
          style={{
            backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.4)',
            borderColor: isLiked ? '#ef4444' : 'rgba(0,0,0,0.08)',
          }}
        >
          <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
          <span style={{ color: isLiked ? '#ef4444' : 'inherit' }}>{note.likes || 0}</span>
        </button>

        <div className="postit-tools no-drag">
          {/* Maximize / Expand View Button */}
          {onViewNote && (
            <button
              type="button"
              className="postit-tool-btn"
              title="ดูแบบขยายใหญ่"
              onClick={(e) => {
                e.stopPropagation();
                onViewNote(note);
              }}
            >
              <Maximize2 size={14} />
            </button>
          )}

          {/* Color Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="postit-tool-btn"
              title="เปลี่ยนสี"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
            >
              <Palette size={14} />
            </button>

            {showColorPicker && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '120%',
                  right: 0,
                  backgroundColor: 'var(--bg-card)',
                  padding: '6px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  gap: '4px',
                  zIndex: 100,
                  border: '1px solid var(--border-color)',
                }}
              >
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                    }}
                    className={`postit-${c}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(note.id, { color: c });
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            type="button"
            className="postit-tool-btn"
            title="ลบ Post-it"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('คุณต้องการลบ Post-it แผ่นนี้ใช่หรือไม่?')) {
                onDelete(note.id);
              }
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
