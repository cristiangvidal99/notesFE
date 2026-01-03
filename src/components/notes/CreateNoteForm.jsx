import { useState } from "react";

function CreateNoteForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() || content.trim()) {
      onCreate(title.trim(), content.trim());
      setTitle("");
      setContent("");
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setIsExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="create-note-form">
      <div className="form-inputs">
        <input
          type="text"
          placeholder="Título..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="note-title-input"
        />
        {isExpanded && (
          <>
            <textarea
              placeholder="Escribe tu nota aquí..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="note-content-input"
              rows={4}
            />
            <div className="form-actions">
              <button type="submit" className="save-btn">
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}

export default CreateNoteForm;
