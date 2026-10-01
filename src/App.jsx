import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

import Header from './components/Header';
import Whiteboard from './components/Whiteboard';
import HomePage from './components/HomePage';
import NameModal from './components/NameModal';
import RoomModal from './components/RoomModal';
import RoomListModal from './components/RoomListModal';
import NoteModal from './components/NoteModal';
import PasswordModal from './components/PasswordModal';

import ViewNoteModal from './components/ViewNoteModal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // View Router State ('home' | 'board' | 'admin')
  const [viewMode, setViewMode] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/axthur545eiei')) {
      return 'admin';
    }
    const params = new URLSearchParams(window.location.search);
    return params.has('room') ? 'board' : 'home';
  });

  // User Identity State
  const [userName, setUserName] = useState(() => localStorage.getItem('postit_username') || '');
  const [showNameModal, setShowNameModal] = useState(false);

  // Rooms & Active Room State
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || 'general';
  });

  const [notes, setNotes] = useState([]);

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showRoomListModal, setShowRoomListModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedViewNote, setSelectedViewNote] = useState(null);
  const [pendingRoomId, setPendingRoomId] = useState(null);

  const [presetNotePos, setPresetNotePos] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('postit_theme') === 'dark');
  const [isFreeform, setIsFreeform] = useState(() => localStorage.getItem('postit_layout') !== 'grid');
  const [toasts, setToasts] = useState([]);

  const wsRef = useRef(null);

  // Toast Helper
  const addToast = useCallback((message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('postit_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Layout Sync
  useEffect(() => {
    localStorage.setItem('postit_layout', isFreeform ? 'freeform' : 'grid');
  }, [isFreeform]);

  // Save User Display Name
  const handleSaveName = (name) => {
    setUserName(name);
    localStorage.setItem('postit_username', name);
    setShowNameModal(false);
    addToast(`บันทึกชื่อเรียบร้อย: คุณ ${name}`);
  };

  // Fetch All Public Rooms
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  }, []);

  // Fetch Notes for a Room with Password Check
  const fetchNotes = useCallback(async (roomId, password = null) => {
    try {
      const storedPwd = password || sessionStorage.getItem(`room_pwd_${roomId}`) || '';
      const isAdmin = window.location.pathname.includes('/axthur545eiei') || sessionStorage.getItem('is_admin') === 'true';

      const res = await fetch(`/api/rooms/${roomId}/notes`, {
        headers: {
          'x-room-password': storedPwd,
          'x-admin-bypass': isAdmin ? 'true' : 'false',
        },
      });
      const data = await res.json();

      if (res.status === 401 || (data.is_protected && !data.success)) {
        if (!isAdmin) {
          setPendingRoomId(roomId);
          setShowPasswordModal(true);
          return false;
        }
      }

      if (data.success) {
        setNotes(data.notes);
        if (storedPwd) {
          sessionStorage.setItem(`room_pwd_${roomId}`, storedPwd);
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
    return false;
  }, []);

  // Room Switch Handler
  const changeRoom = async (roomId, isDirectAdminBypass = false) => {
    const isAdmin = isDirectAdminBypass || window.location.pathname.includes('/axthur545eiei') || sessionStorage.getItem('is_admin') === 'true';
    if (isAdmin) {
      sessionStorage.setItem('is_admin', 'true');
    }

    const targetRoom = rooms.find((r) => r.id === roomId);
    if (targetRoom && targetRoom.is_protected === 1 && !isAdmin) {
      const storedPwd = sessionStorage.getItem(`room_pwd_${roomId}`);
      if (!storedPwd) {
        setPendingRoomId(roomId);
        setShowPasswordModal(true);
        return;
      }
    }

    const success = await fetchNotes(roomId);
    if (success !== false || isAdmin) {
      setActiveRoomId(roomId);
      setViewMode('board');
      const newUrl = `${window.location.pathname}?room=${roomId}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  // Go Home Handler
  const handleGoHome = () => {
    setViewMode('home');
    const newUrl = window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  // Room Password Verification
  const handleVerifyPassword = async (password, setError) => {
    if (!pendingRoomId) return;
    try {
      const res = await fetch(`/api/rooms/${pendingRoomId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem(`room_pwd_${pendingRoomId}`, password);
        setShowPasswordModal(false);
        setActiveRoomId(pendingRoomId);
        setViewMode('board');
        const newUrl = `${window.location.pathname}?room=${pendingRoomId}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        await fetchNotes(pendingRoomId, password);
        addToast('เข้าสู่กระดานสำเร็จ');
        setPendingRoomId(null);
      } else {
        setError(data.error || 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('ไม่สามารถตรวจสอบรหัสผ่านได้');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (activeRoomId && viewMode === 'board') {
      fetchNotes(activeRoomId);
    }
  }, [activeRoomId, viewMode, fetchNotes]);

  // WebSocket Live Updates
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws`;

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'NOTE_CREATED' && data.note.room_id === activeRoomId) {
          setNotes((prev) => {
            if (prev.some((n) => n.id === data.note.id)) return prev;
            return [...prev, data.note];
          });
        } else if (data.type === 'NOTE_UPDATED' && data.note.room_id === activeRoomId) {
          setNotes((prev) => prev.map((n) => (n.id === data.note.id ? data.note : n)));
        } else if (data.type === 'NOTE_DELETED') {
          setNotes((prev) => prev.filter((n) => n.id !== data.noteId));
        } else if (data.type === 'ROOM_CREATED') {
          fetchRooms();
        } else if (data.type === 'REALTIME_DRAG') {
          setNotes((prev) =>
            prev.map((n) => (n.id === data.noteId ? { ...n, x_pos: data.x_pos, y_pos: data.y_pos } : n))
          );
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    return () => {
      socket.close();
    };
  }, [activeRoomId, fetchRooms]);

  // Actions
  const handleCreateRoom = async (roomName, password) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, password }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchRooms();
        if (password) {
          sessionStorage.setItem(`room_pwd_${data.room.id}`, password);
        }
        changeRoom(data.room.id);
        setShowRoomModal(false);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        addToast(`สร้างกระดาน "${data.room.name}" เรียบร้อยแล้ว`);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการสร้างห้อง');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const handleCreateNote = async (noteData) => {
    try {
      if (noteData.author_name) {
        setUserName(noteData.author_name);
        localStorage.setItem('postit_username', noteData.author_name);
      }

      const isMobile = window.innerWidth <= 640;
      const maxSpawnX = isMobile ? 110 : 280;
      const payload = {
        ...noteData,
        x_pos: presetNotePos
          ? Math.max(10, Math.min(presetNotePos.x, window.innerWidth - (isMobile ? 230 : 290)))
          : Math.floor(Math.random() * maxSpawnX) + 20,
        y_pos: presetNotePos ? presetNotePos.y : Math.floor(Math.random() * 160) + 70,
      };

      const storedPwd = sessionStorage.getItem(`room_pwd_${activeRoomId}`) || '';
      const res = await fetch(`/api/rooms/${activeRoomId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-room-password': storedPwd,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setNotes((prev) => [...prev, data.note]);
        setShowNoteModal(false);
        setPresetNotePos(null);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
        addToast('แปะ Post-it บนกระดานเรียบร้อย');
      } else {
        alert(data.error || 'ไม่สามารถแปะ Post-it ได้');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNote = async (noteId, updates) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...updates } : n)));

    try {
      await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));

    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('ลบ Post-it เรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLikeNote = async (noteId, isLiked) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, likes: isLiked ? (n.likes || 0) + 1 : Math.max(0, (n.likes || 1) - 1) } : n
      )
    );

    try {
      await fetch(`/api/notes/${noteId}/toggle-like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: isLiked }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBringToFront = (noteId) => {
    const maxZ = Math.max(...notes.map((n) => n.z_index || 0), 0) + 1;
    handleUpdateNote(noteId, { z_index: maxZ });
  };

  const handleStartDragNote = (noteId, x_pos, y_pos) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, x_pos, y_pos } : n)));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'DRAG_NOTE', noteId, x_pos, y_pos }));
    }
  };

  const handleDoubleClickBoard = (x, y) => {
    setPresetNotePos({ x, y });
    setShowNoteModal(true);
  };

  const handleShareRoom = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('คัดลอกลิงก์กระดานเรียบร้อย สามารถส่งให้เพื่อนได้ทันที');
  };

  const activeRoomObj = rooms.find((r) => r.id === activeRoomId) || { id: activeRoomId, name: activeRoomId };

  return (
    <div className="app-container">
      {viewMode === 'admin' ? (
        /* Super Admin Control Panel (/axthur545eiei) */
        <AdminPanel
          onGoHome={handleGoHome}
          onSelectRoom={(roomId) => changeRoom(roomId)}
          addToast={addToast}
        />
      ) : viewMode === 'home' ? (
        /* Home Landing Page */
        <HomePage
          rooms={rooms}
          userName={userName}
          onSelectRoom={changeRoom}
          onOpenCreateRoom={() => setShowRoomModal(true)}
          onOpenEditName={() => setShowNameModal(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      ) : (
        /* Whiteboard Dashboard View */
        <>
          <Header
            activeRoom={activeRoomObj}
            userName={userName}
            isDarkMode={isDarkMode}
            isFreeform={isFreeform}
            onOpenRoomList={() => setShowRoomListModal(true)}
            onOpenCreateRoom={() => setShowRoomModal(true)}
            onOpenCreateNote={() => {
              setPresetNotePos(null);
              setShowNoteModal(true);
            }}
            onOpenEditName={() => setShowNameModal(true)}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            onToggleLayout={() => setIsFreeform(!isFreeform)}
            onShareRoom={handleShareRoom}
            onGoHome={handleGoHome}
          />

          <Whiteboard
            notes={notes}
            activeRoom={activeRoomObj}
            currentUserName={userName}
            isFreeform={isFreeform}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onToggleLikeNote={handleToggleLikeNote}
            onBringToFront={handleBringToFront}
            onStartDragNote={handleStartDragNote}
            onDoubleClickBoard={handleDoubleClickBoard}
            onOpenCreateNote={() => {
              setPresetNotePos(null);
              setShowNoteModal(true);
            }}
            onViewNote={(note) => setSelectedViewNote(note)}
          />
        </>
      )}

      {/* Modals */}
      {selectedViewNote && (
        <ViewNoteModal
          note={notes.find((n) => n.id === selectedViewNote.id) || selectedViewNote}
          currentUserName={userName}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onToggleLikeNote={handleToggleLikeNote}
          onClose={() => setSelectedViewNote(null)}
        />
      )}

      {showNameModal && (
        <NameModal
          currentName={userName}
          onSave={handleSaveName}
          isMandatory={!userName}
          onClose={() => setShowNameModal(false)}
        />
      )}

      {showRoomModal && (
        <RoomModal onCreateRoom={handleCreateRoom} onClose={() => setShowRoomModal(false)} />
      )}

      {showRoomListModal && (
        <RoomListModal
          rooms={rooms}
          activeRoomId={activeRoomId}
          onSelectRoom={changeRoom}
          onOpenCreateRoom={() => setShowRoomModal(true)}
          onClose={() => setShowRoomListModal(false)}
        />
      )}

      {showNoteModal && (
        <NoteModal
          defaultAuthor={userName}
          onSave={handleCreateNote}
          onClose={() => setShowNoteModal(false)}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          roomName={rooms.find((r) => r.id === pendingRoomId)?.name || pendingRoomId}
          onVerify={handleVerifyPassword}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-item">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
