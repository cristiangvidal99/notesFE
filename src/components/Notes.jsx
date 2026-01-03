import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotes,
  createNote,
  deleteNote,
  restoreNote,
} from "./notes/NotesApi";
import CreateNoteForm from "./notes/CreateNoteForm";
import NoteCard from "./notes/NoteCard";
import "./Notes.css";

const DELETED_NOTES_KEY = "deletedNotes";

function getDeletedNotesFromStorage(userId) {
  try {
    const key = `${DELETED_NOTES_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Error al cargar notas eliminadas:", err);
    return [];
  }
}

function saveDeletedNotesToStorage(userId, deletedNotes) {
  try {
    const key = `${DELETED_NOTES_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(deletedNotes));
  } catch (err) {
    console.error("Error al guardar notas eliminadas:", err);
  }
}

function removeDeletedNoteFromStorage(userId, noteId) {
  try {
    const key = `${DELETED_NOTES_KEY}_${userId}`;
    const stored = getDeletedNotesFromStorage(userId);
    const updated = stored.filter((note) => note.id !== noteId);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error("Error al remover nota eliminada:", err);
  }
}

function Notes() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [notes, setNotes] = useState([]);
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedNoteId, setDraggedNoteId] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await getNotes();

      // Manejar diferentes formatos de respuesta del backend
      let notesArray = [];
      if (Array.isArray(response)) {
        notesArray = response;
      } else if (response.data && Array.isArray(response.data)) {
        notesArray = response.data;
      } else if (response.notes && Array.isArray(response.notes)) {
        notesArray = response.notes;
      } else {
        console.error("Formato de respuesta inesperado:", response);
        setError("Formato de respuesta inválido del servidor");
        return;
      }

      // Separar notas activas y eliminadas usando is_deleted (boolean)
      const active = notesArray.filter((note) => !note.is_deleted);

      // Cargar notas eliminadas desde localStorage
      const userId = user.id || user.user_id;
      const storedDeleted = userId ? getDeletedNotesFromStorage(userId) : [];

      // Combinar notas eliminadas del backend con las del localStorage
      const backendDeleted = notesArray.filter((note) => note.is_deleted);
      const allDeleted = [...backendDeleted, ...storedDeleted];

      // Eliminar duplicados por ID
      const uniqueDeleted = Array.from(
        new Map(allDeleted.map((note) => [note.id, note])).values()
      );

      setNotes(active);
      setDeletedNotes(uniqueDeleted);
    } catch (err) {
      setError(err.message || "Error al cargar las notas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (title, content) => {
    try {
      const response = await createNote(title, content);
      // Manejar diferentes formatos de respuesta
      const newNote = response.note || response.data || response;
      setNotes([newNote, ...notes]);
    } catch (err) {
      setError(err.message || "Error al crear la nota");
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      const noteToDelete = notes.find((n) => n.id === id);
      if (noteToDelete) {
        const updatedNotes = notes.filter((n) => n.id !== id);
        const deletedNote = {
          ...noteToDelete,
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        };
        const updatedDeleted = [...deletedNotes, deletedNote];

        setNotes(updatedNotes);
        setDeletedNotes(updatedDeleted);

        // Guardar en localStorage
        const userId = user.id || user.user_id;
        if (userId) {
          saveDeletedNotesToStorage(userId, updatedDeleted);
        }
      }
    } catch (err) {
      setError(err.message || "Error al eliminar la nota");
    }
  };

  const handleRestoreNote = async (id) => {
    try {
      // Buscar la nota en el reciclaje
      const noteToRestore = deletedNotes.find((n) => n.id === id);
      if (!noteToRestore) {
        setError("No se encontró la nota a restaurar");
        return;
      }

      // Crear la nota nuevamente en el backend con POST
      const response = await createNote(
        noteToRestore.title || "",
        noteToRestore.content || ""
      );

      // Manejar diferentes formatos de respuesta
      const newNote = response.note || response.data || response;

      // Actualizar estados
      const updatedDeleted = deletedNotes.filter((n) => n.id !== id);
      setDeletedNotes(updatedDeleted);
      setNotes([newNote, ...notes]);

      // Remover de localStorage
      const userId = user.id || user.user_id;
      if (userId) {
        removeDeletedNoteFromStorage(userId, id);
      }
    } catch (err) {
      setError(err.message || "Error al restaurar la nota");
    }
  };

  const handleDragStart = (noteId) => {
    setDraggedNoteId(noteId);
  };

  const handleDragEnd = () => {
    setDraggedNoteId(null);
  };

  const handleDragOver = (e, section) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSection(section);
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDropOnActive = async (e) => {
    e.preventDefault();
    setDragOverSection(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const { id, isDeleted: wasDeleted } = data;

      // Si viene de reciclaje, restaurar
      if (wasDeleted) {
        await handleRestoreNote(id);
      }
    } catch (err) {
      console.error("Error al procesar drop:", err);
    }
    setDraggedNoteId(null);
  };

  const handleDropOnDeleted = async (e) => {
    e.preventDefault();
    setDragOverSection(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const { id, isDeleted: wasDeleted } = data;

      // Si viene de activas, eliminar
      if (!wasDeleted) {
        await handleDeleteNote(id);
      }
    } catch (err) {
      console.error("Error al procesar drop:", err);
    }
    setDraggedNoteId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
    // No limpiar las notas eliminadas para que persistan entre sesiones
    navigate("/login");
  };

  return (
    <div className="notes-container">
      <header className="notes-header">
        <h1 className="notes-title">Notas</h1>
        <div className="header-actions">
          <span className="user-greeting">
            {user.full_name || user.email || "Usuario"}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button onClick={() => setError("")} className="error-close">
            ×
          </button>
        </div>
      )}

      <div className="notes-content">
        <section
          className={`notes-section active-notes ${
            dragOverSection === "active" ? "drag-over" : ""
          }`}
          onDragOver={(e) => handleDragOver(e, "active")}
          onDragLeave={handleDragLeave}
          onDrop={handleDropOnActive}
        >
          <div className="section-header">
            <h2>Notas Activas</h2>
            <span className="notes-count">{notes.length}</span>
          </div>

          <CreateNoteForm onCreate={handleCreateNote} />

          {isLoading ? (
            <div className="loading-state">Cargando notas...</div>
          ) : notes.length === 0 ? (
            <div className="empty-state drop-zone">
              <p>No tienes notas aún. ¡Crea tu primera nota!</p>
              <p className="drop-hint">Arrastra notas aquí para restaurarlas</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note, index) => (
                <NoteCard
                  key={note.id || `note-active-${index}`}
                  note={note}
                  onDelete={handleDeleteNote}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDeleted={false}
                />
              ))}
            </div>
          )}
        </section>

        <section
          className={`notes-section deleted-notes ${
            dragOverSection === "deleted" ? "drag-over" : ""
          }`}
          onDragOver={(e) => handleDragOver(e, "deleted")}
          onDragLeave={handleDragLeave}
          onDrop={handleDropOnDeleted}
        >
          <div className="section-header">
            <h2>Reciclaje</h2>
            <span className="notes-count">{deletedNotes.length}</span>
          </div>

          {deletedNotes.length === 0 ? (
            <div className="empty-state drop-zone">
              <p>No hay notas eliminadas</p>
              <p className="drop-hint">Arrastra notas aquí para eliminarlas</p>
            </div>
          ) : (
            <div className="notes-grid">
              {deletedNotes.map((note, index) => (
                <NoteCard
                  key={note.id || `note-deleted-${index}`}
                  note={note}
                  onRestore={handleRestoreNote}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDeleted={true}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Notes;
