import React, { useState } from 'react';
import { X, Heart, Trash2, Palette, Calendar, User, Maximize2, Sparkles } from 'lucide-react';

const COLORS = ['yellow', 'peach', 'green', 'blue', 'purple', 'pink', 'white'];

export default function ViewNoteModal({ note, currentUserName, onUpdateNote, onDeleteNote, onToggleLikeNote, onClose }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isZoomImage, setIsZoomImage] = useState(false);

  // Track liked state from localStorage
  const [isLiked, setIsLiked] = useState(() => {
    try {
      const likedNotes = JSON.parse(localStorage.getItem('liked_notes') || '[]');
      return likedNotes.includes(note.id);
    } catch (e) {
      return false;
    }
  });

  const handleLikeClick = () => {
    try {
      const likedNotes = JSON.parse(localStorage.getItem('liked_notes') || '[]');
      let updatedLikedNotes;
      let newLikedState;

      if (isLiked) {
        updatedLikedNotes = likedNotes.filter((id) => id !== note.id);
        newLikedState = false;
      } else {
        updatedLikedNotes = [...likedNotes, note.id];
        newLikedState = true;
      }

      localStorage.setItem('liked_notes', JSON.stringify(updatedLikedNotes));
      setIsLiked(newLikedState);
      onToggleLikeNote(note.id, newLikedState);
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const formattedDateTime = note.created_at
    ? new Date(note.created_at).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'เมื่อซักครู่';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      {/* Zoom Image Fullscreen Modal */}
      {isZoomImage && note.image_url && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.92)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            cursor: 'zoom-out',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomImage(false);
          }}
        >
          <img
            src={note.image_url}
            alt="Expanded view"
            style={{
              maxWidth: '96vw',
              maxHeight: '92vh',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          />
          <button
            type="button"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setIsZoomImage(false)}
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Main Expanded Post-it Card */}
      <div
        className={`modal-card postit-${note.color || 'yellow'} font-${note.font_style || 'sans'}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 92vw)',
          padding: '28px 24px 20px 24px',
          position: 'relative',
          borderRadius: 8,
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Tape Decorator */}
        <div className="postit-tape" style={{ width: 90, height: 26, top: -13 }} />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(0,0,0,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'all 0.2s ease',
          }}
          title="ปิดหน้าต่าง"
        >
          <X size={18} />
        </button>

        {/* Author & Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {(note.author_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>
                {note.author_name || 'ไม่ระบุชื่อ'}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Calendar size={12} /> {formattedDateTime}
              </div>
            </div>
          </div>
        </div>

        {/* Large Attached Image View */}
        {note.image_url && (
          <div
            style={{
              position: 'relative',
              marginBottom: 16,
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'zoom-in',
              backgroundColor: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
            onClick={() => setIsZoomImage(true)}
            title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม"
          >
            <img
              src={note.image_url}
              alt="Attached content"
              style={{
                width: '100%',
                maxHeight: 360,
                objectFit: 'contain',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: 'rgba(0,0,0,0.65)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                backdropFilter: 'blur(4px)',
              }}
            >
              <Maximize2 size={12} /> คลิกขยายเต็มจอ
            </div>
          </div>
        )}

        {/* Large Text Content Body */}
        <div
          style={{
            fontSize: note.font_style === 'handwriting' ? '1.75rem' : '1.1rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 280,
            overflowY: 'auto',
            paddingRight: 6,
            marginBottom: 20,
          }}
        >
          {note.content || '(ไม่มีข้อความ)'}
        </div>

        {/* Action Toolbar Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLikeClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${isLiked ? '#ef4444' : 'rgba(0,0,0,0.12)'}`,
              backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: isLiked ? '#ef4444' : 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
            <span>{note.likes || 0} ถูกใจ</span>
          </button>

          {/* Tools: Color Switcher & Delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Color Switcher */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="เปลี่ยนสี Post-it"
              >
                <Palette size={14} /> เปลี่ยนสี
              </button>

              {showColorPicker && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '120%',
                    right: 0,
                    backgroundColor: 'var(--bg-card)',
                    padding: 8,
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    gap: 6,
                    zIndex: 100,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: '1px solid rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                      }}
                      className={`postit-${c}`}
                      onClick={() => {
                        onUpdateNote(note.id, { color: c });
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
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
              onClick={() => {
                if (window.confirm('คุณต้องการลบ Post-it แผ่นนี้ใช่หรือไม่?')) {
                  onDeleteNote(note.id);
                  onClose();
                }
              }}
            >
              <Trash2 size={14} /> ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
