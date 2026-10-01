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

function renderHighlightedText(text, term) {
  if (!text || !term || !term.trim()) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function PostItNote({
  note,
  currentUserName,
  onUpdate,
  onDelete,
  onToggleLike,
  onBringToFront,
  isFreeform,
  searchTerm,
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

  const currentPosRef = useRef({ x: note.x_pos || 0, y: note.y_pos || 0 });
  const pointerRef = useRef({ clientX: 0, clientY: 0 });

  useEffect(() => {
    currentPosRef.current = { x: note.x_pos || 0, y: note.y_pos || 0 };
  }, [note.x_pos, note.y_pos]);

  const handleMouseDown = (e) => {
    if (!isFreeform) return;
    if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('.no-drag')) {
      return;
    }

    onBringToFront(note.id);
    setIsDragging(true);

    const rect = noteRef.current.getBoundingClientRect();
    pointerRef.current = { clientX: e.clientX, clientY: e.clientY };
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
    pointerRef.current = { clientX: touch.clientX, clientY: touch.clientY };
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    let animId = null;

    const updatePositionAndAutoScroll = () => {
      const canvas = document.querySelector('.whiteboard-canvas');
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const { clientX, clientY } = pointerRef.current;
        const EDGE_MARGIN = 55;
        const MAX_SPEED = 14;

        let scrollDx = 0;
        let scrollDy = 0;

        // Check Right Edge
        if (clientX > canvasRect.right - EDGE_MARGIN) {
          const factor = Math.min(1, (clientX - (canvasRect.right - EDGE_MARGIN)) / EDGE_MARGIN);
          scrollDx = Math.max(3, Math.round(factor * MAX_SPEED));
        }
        // Check Left Edge
        else if (clientX < canvasRect.left + EDGE_MARGIN) {
          const factor = Math.min(1, ((canvasRect.left + EDGE_MARGIN) - clientX) / EDGE_MARGIN);
          scrollDx = -Math.max(3, Math.round(factor * MAX_SPEED));
        }

        // Check Bottom Edge
        if (clientY > canvasRect.bottom - EDGE_MARGIN) {
          const factor = Math.min(1, (clientY - (canvasRect.bottom - EDGE_MARGIN)) / EDGE_MARGIN);
          scrollDy = Math.max(3, Math.round(factor * MAX_SPEED));
        }
        // Check Top Edge
        else if (clientY < canvasRect.top + EDGE_MARGIN) {
          const factor = Math.min(1, ((canvasRect.top + EDGE_MARGIN) - clientY) / EDGE_MARGIN);
          scrollDy = -Math.max(3, Math.round(factor * MAX_SPEED));
        }

        if (scrollDx !== 0 || scrollDy !== 0) {
          canvas.scrollLeft += scrollDx;
          canvas.scrollTop += scrollDy;
        }

        const scrollLeft = canvas.scrollLeft;
        const scrollTop = canvas.scrollTop;
        const newX = Math.max(0, Math.round(clientX - canvasRect.left + scrollLeft - dragOffset.x));
        const newY = Math.max(0, Math.round(clientY - canvasRect.top + scrollTop - dragOffset.y));

        currentPosRef.current = { x: newX, y: newY };
        onStartDrag(note.id, newX, newY);
      }

      animId = requestAnimationFrame(updatePositionAndAutoScroll);
    };

    const handleMouseMove = (e) => {
      pointerRef.current = { clientX: e.clientX, clientY: e.clientY };
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        if (e.cancelable) e.preventDefault();
        pointerRef.current = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
    };

    const handleDragEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        onUpdate(note.id, { x_pos: currentPosRef.current.x, y_pos: currentPosRef.current.y });
      }
    };

    animId = requestAnimationFrame(updatePositionAndAutoScroll);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging, dragOffset, note.id, onStartDrag, onUpdate]);

  const formattedTime = new Date(note.created_at || Date.now()).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasSearchTerm = Boolean(searchTerm && searchTerm.trim());
  const isSearchMatched =
    hasSearchTerm &&
    Boolean(
      (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.author_name && note.author_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  const isSearchDimmed = hasSearchTerm && !isSearchMatched;

  return (
    <div
      ref={noteRef}
      className={`postit-card postit-${note.color || 'yellow'} font-${note.font_style || 'sans'} ${
        isSearchMatched ? 'search-matched' : ''
      } ${isSearchDimmed ? 'search-dimmed' : ''}`}
      style={
        isFreeform
          ? {
              left: `${Math.max(0, note.x_pos || 0)}px`,
              top: `${Math.max(0, note.y_pos || 0)}px`,
              zIndex: isDragging ? 9999 : isSearchMatched ? 990 : note.z_index || 1,
              transform: isDragging ? 'scale(1.04) rotate(0deg)' : `rotate(${rotation.current}deg)`,
              touchAction: 'none',
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
            {renderHighlightedText(note.author_name || 'ไม่ระบุชื่อ', searchTerm)}
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
        {renderHighlightedText(note.content, searchTerm)}
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
