import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';

export function Notepad() {
  const { notes, addNote, updateNote, deleteNote } = useAppStore();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [showList, setShowList] = useState(false);

  // Load note content when selecting a note
  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find(n => n.id === activeNoteId);
      if (note) {
        setContent(note.content);
      }
    } else {
      setContent('');
    }
  }, [activeNoteId, notes]);

  const handleNewNote = async () => {
    const newId = crypto.randomUUID();
    await addNote({
      id: newId,
      title: `Catatan ${notes.length + 1}`,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setActiveNoteId(newId);
    setShowList(false);
  };

  const handleSave = async () => {
    if (activeNoteId && content.trim()) {
      const note = notes.find(n => n.id === activeNoteId);
      await updateNote(activeNoteId, {
        ...note!,
        content: content,
        updatedAt: new Date().toISOString(),
      });
      alert('Catatan disimpan!');
    }
  };

  const handleDelete = async () => {
    if (activeNoteId && confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      await deleteNote(activeNoteId);
      setActiveNoteId(null);
      setContent('');
    }
  };

  const handleExport = () => {
    if (activeNoteId && content.trim()) {
      const note = notes.find(n => n.id === activeNoteId);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note?.title || 'catatan'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout title="Notepad">
      <div className="p-4">
        {/* Header Actions */}
        <div className="flex gap-2 mb-4">
          <div className="btn-wrapper flex-1">
            <button onClick={handleNewNote} className="btn w-full py-2">
              <span className="btn-letter">C</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">t</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">t</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">n</span>
              <span className="btn-letter"> </span>
              <span className="btn-letter">B</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">r</span>
              <span className="btn-letter">u</span>
            </button>
          </div>
          <div className="btn-wrapper">
            <button
              onClick={() => setShowList(!showList)}
              className="btn px-4 py-2"
            >
              <span className="btn-letter">
                {showList ? '✎ Tulis' : '📁 Daftar'}
              </span>
            </button>
          </div>
        </div>

        {/* Note List View */}
        {showList && (
          <div className="space-y-2 mb-4">
            {notes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Belum ada catatan</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    setShowList(false);
                  }}
                  className={`card-3d p-3 cursor-pointer transition-smooth ${
                    activeNoteId === note.id ? 'border-l-4 border-primary' : ''
                  }`}
                >
                  <h4 className="font-medium text-gray-100">{note.title}</h4>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {note.content || 'Kosong...'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Note Editor View */}
        {!showList && (
          <div className="space-y-4">
            {activeNoteId ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-100">
                    {notes.find(n => n.id === activeNoteId)?.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatDate(notes.find(n => n.id === activeNoteId)?.updatedAt || '')}
                  </span>
                </div>
                
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis catatan Anda di sini..."
                  className="w-full h-64 p-4 border border-gray-700 rounded-card focus:outline-none focus:ring-2 focus:ring-primary resize-none input-3d text-gray-100"
                />

                <div className="flex gap-2">
                  <div className="btn-wrapper flex-1">
                    <button onClick={handleSave} className="btn w-full py-3">
                      <span className="btn-letter">💾</span>
                      <span className="btn-letter"> </span>
                      <span className="btn-letter">S</span>
                      <span className="btn-letter">i</span>
                      <span className="btn-letter">m</span>
                      <span className="btn-letter">p</span>
                      <span className="btn-letter">a</span>
                      <span className="btn-letter">n</span>
                    </button>
                  </div>
                  <div className="btn-wrapper flex-1">
                    <button onClick={handleExport} className="btn w-full py-3">
                      <span className="btn-letter">📤</span>
                      <span className="btn-letter"> </span>
                      <span className="btn-letter">E</span>
                      <span className="btn-letter">x</span>
                      <span className="btn-letter">p</span>
                      <span className="btn-letter">o</span>
                      <span className="btn-letter">r</span>
                      <span className="btn-letter">t</span>
                      <span className="btn-letter"> </span>
                      <span className="btn-letter">.txt</span>
                    </button>
                  </div>
                  <div className="btn-wrapper">
                    <button onClick={handleDelete} className="btn px-4 py-3">
                      <span className="btn-letter">🗑️</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl">📝</span>
                <p className="mt-4 text-gray-400">Pilih catatan atau buat baru</p>
                <div className="btn-wrapper mt-4">
                  <button onClick={handleNewNote} className="btn px-6 py-2">
                    <span className="btn-letter">C</span>
                    <span className="btn-letter">a</span>
                    <span className="btn-letter">t</span>
                    <span className="btn-letter">a</span>
                    <span className="btn-letter">t</span>
                    <span className="btn-letter">a</span>
                    <span className="btn-letter">n</span>
                    <span className="btn-letter"> </span>
                    <span className="btn-letter">B</span>
                    <span className="btn-letter">a</span>
                    <span className="btn-letter">r</span>
                    <span className="btn-letter">u</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
