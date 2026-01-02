import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "./auth/AuthApi";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación básica
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (isRegisterMode && !fullName.trim()) {
      setError("Por favor ingresa tu nombre completo");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor ingresa un email válido");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = isRegisterMode
        ? await register(email, password, fullName)
        : await login(email, password);

      // El backend retorna: { session: { access_token, ... }, user: {...}, success: true }
      const token =
        response.session?.access_token ||
        response.token ||
        response.access_token ||
        response.authToken;

      if (token) {
        localStorage.setItem("token", token);

        // Guardar también el refresh_token si está disponible
        if (response.session?.refresh_token) {
          localStorage.setItem("refresh_token", response.session.refresh_token);
        }

        // Guardar datos del usuario
        const userData = response.user || { email, full_name: fullName };
        localStorage.setItem("user", JSON.stringify(userData));

        // Forzar navegación
        navigate("/notes", { replace: true });
      } else {
        setError("Respuesta inválida del servidor: no se recibió token");
      }
    } catch (err) {
      setError(
        err.message ||
          `Error al ${
            isRegisterMode ? "registrarse" : "iniciar sesión"
          }. Por favor intenta nuevamente.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          {isRegisterMode ? "Crear Cuenta" : "Iniciar Sesión"}
        </h1>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegisterMode && (
            <div className="form-group">
              <label htmlFor="fullName">Nombre Completo</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                disabled={isLoading}
                autoComplete="name"
                aria-required="true"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={isLoading}
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete={
                isRegisterMode ? "new-password" : "current-password"
              }
              aria-required="true"
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading
              ? isRegisterMode
                ? "Registrando..."
                : "Iniciando sesión..."
              : isRegisterMode
              ? "Registrarse"
              : "Iniciar Sesión"}
          </button>

          <div className="auth-switch">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError("");
                setFullName("");
              }}
              className="switch-button"
              disabled={isLoading}
            >
              {isRegisterMode
                ? "¿Ya tienes cuenta? Inicia sesión"
                : "¿No tienes cuenta? Regístrate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
