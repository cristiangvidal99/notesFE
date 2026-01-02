import { useNavigate } from "react-router-dom";

function Notes() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Notas</h1>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <span>Hola, {user.email || user.full_name || "Usuario"}</span>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </div>
      <p>Aquí irían tus notas...</p>
    </div>
  );
}

export default Notes;
