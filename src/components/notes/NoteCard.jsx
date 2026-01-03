function NoteCard({
  note,
  onDelete,
  onRestore,
  isDeleted = false,
  onDragStart,
  onDragEnd,
}) {
  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
      onDelete(note.id);
    }
  };

  const handleRestore = () => {
    onRestore(note.id);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ id: note.id, isDeleted })
    );
    if (onDragStart) {
      onDragStart(note.id);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const cardStyle =
    note.color && note.color !== "#ffffff"
      ? { borderLeft: `4px solid ${note.color}` }
      : {};

  return (
    <div
      className="note-card"
      style={cardStyle}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="note-card-header">
        <h3 className="note-title">{note.title || "Sin título"}</h3>
        <div className="note-actions">
          {isDeleted ? (
            <button
              onClick={handleRestore}
              className="note-action-btn restore-btn"
              title="Restaurar nota"
            >
              ↻
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="note-action-btn delete-btn"
              title="Eliminar nota"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="note-content">
        {note.content ? (
          <p>{note.content}</p>
        ) : (
          <p className="note-empty">Sin contenido</p>
        )}
      </div>
      {note.created_at && (
        <div className="note-footer">
          <span className="note-date">
            {new Date(note.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

export default NoteCard;
