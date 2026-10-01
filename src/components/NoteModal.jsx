import React, { useState } from 'react';
import { PlusCircle, Palette, Type, User, Image as ImageIcon, Upload, X, Link as LinkIcon } from 'lucide-react';

const COLOR_OPTIONS = [
  { id: 'yellow', name: 'Canary Yellow', bg: '#fef3c7', border: '#fde68a' },
  { id: 'peach', name: 'Warm Peach', bg: '#ffedd5', border: '#fed7aa' },
  { id: 'green', name: 'Sage Mint', bg: '#dcfce7', border: '#bbf7d0' },
  { id: 'blue', name: 'Ice Blue', bg: '#e0f2fe', border: '#bae6fd' },
  { id: 'purple', name: 'Lavender', bg: '#f3e8ff', border: '#e9d5ff' },
  { id: 'pink', name: 'Rose Blush', bg: '#ffe4e6', border: '#fecdd3' },
  { id: 'white', name: 'Minimal White', bg: '#ffffff', border: '#e2e8f0' },
];

const FONT_OPTIONS = [
  { id: 'sans', name: 'Sans', family: 'var(--font-main)' },
  { id: 'handwriting', name: 'Handwriting', family: 'var(--font-handwriting)' },
  { id: 'mono', name: 'Mono', family: 'var(--font-mono)' },
];

export default function NoteModal({ initialData, defaultAuthor, onSave, onClose }) {
  const [content, setContent] = useState(initialData?.content || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [authorName, setAuthorName] = useState(initialData?.author_name || defaultAuthor || '');
  const [selectedColor, setSelectedColor] = useState(initialData?.color || 'yellow');
  const [selectedFont, setSelectedFont] = useState(initialData?.font_style || 'handwriting');
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [error, setError] = useState('');

  // Handle local image file upload with automatic compression
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImageUrl(dataUrl);
        setError('');
      };
      img.onerror = () => {
        setError('ไม่สามารถอ่านไฟล์รูปภาพนี้ได้');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim()) {
      setError('กรุณาใส่ข้อความ หรือ แนบรูปภาพบน Post-it');
      return;
    }
    if (!authorName.trim()) {
      setError('กรุณาระบุชื่อของคุณ (Author name required)');
      return;
    }

    onSave({
      content: content.trim(),
      image_url: imageUrl.trim() || null,
      author_name: authorName.trim(),
      color: selectedColor,
      font_style: selectedFont,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div className="modal-title">
            <PlusCircle size={22} style={{ color: 'var(--accent-color)' }} />
            {initialData ? 'แก้ไข Post-it' : 'แปะ Post-it ใหม่บนกระดาน'}
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Content TextArea */}
          <div className="form-group">
            <label className="form-label" htmlFor="note-content-input">
              ข้อความ (Text Content)
            </label>
            <textarea
              id="note-content-input"
              className={`form-textarea font-${selectedFont}`}
              placeholder="พิมพ์ข้อความ ไอเดีย หรือโน้ตของคุณที่นี่..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError('');
              }}
              autoFocus
              style={{
                backgroundColor: COLOR_OPTIONS.find((c) => c.id === selectedColor)?.bg || '#fff',
                borderColor: COLOR_OPTIONS.find((c) => c.id === selectedColor)?.border || '#e2e8f0',
                color: selectedColor === 'white' ? '#1e293b' : 'inherit',
                fontSize: selectedFont === 'handwriting' ? '1.3rem' : '0.95rem',
              }}
            />
          </div>

          {/* Image Attachment Section */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ImageIcon size={14} />
              แนบรูปภาพประกอบ (Optional)
            </label>

            {imageUrl ? (
              <div style={{ position: 'relative', marginTop: 8 }}>
                <img
                  src={imageUrl}
                  alt="Attachment preview"
                  style={{
                    width: '100%',
                    maxHeight: 160,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="ลบรูปภาพ"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px', backgroundColor: imageMode === 'upload' ? 'var(--accent-light)' : 'transparent' }}
                    onClick={() => setImageMode('upload')}
                  >
                    <Upload size={14} /> อัปโหลดไฟล์รูปภาพ
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px', backgroundColor: imageMode === 'url' ? 'var(--accent-light)' : 'transparent' }}
                    onClick={() => setImageMode('url')}
                  >
                    <LinkIcon size={14} /> วาง Image URL
                  </button>
                </div>

                {imageMode === 'upload' ? (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-canvas)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: 4 }} />
                    <span>คลิกเพื่อเลือกไฟล์รูปภาพจากเครื่อง</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                ) : (
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/image.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                )}
              </div>
            )}
            {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6, display: 'block' }}>{error}</span>}
          </div>

          {/* Author Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="note-author-input">
              <User size={14} style={{ display: 'inline', marginRight: 4 }} />
              ชื่อผู้แปะ Post-it (Author Name)
            </label>
            <input
              id="note-author-input"
              type="text"
              className="form-input"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="ระบุชื่อของคุณ"
              maxLength={30}
            />
          </div>

          {/* Color Selector */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Palette size={14} />
              เลือกสี Post-it
            </label>
            <div className="color-picker-grid">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={`color-swatch-btn ${selectedColor === color.id ? 'selected' : ''}`}
                  style={{ backgroundColor: color.bg, borderColor: color.border }}
                  title={color.name}
                  onClick={() => setSelectedColor(color.id)}
                />
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Type size={14} />
              รูปแบบฟอนต์
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setSelectedFont(font.id)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${selectedFont === font.id ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    backgroundColor: selectedFont === font.id ? 'var(--accent-light)' : 'var(--bg-canvas)',
                    color: selectedFont === font.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                    fontFamily: font.family,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} /> แปะบนกระดาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
