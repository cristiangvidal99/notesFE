/**
 * Configuración de la API
 * Usa variables de entorno para configurar la URL base
 * 
 * En desarrollo: VITE_API_URL=http://localhost:8000
 * En producción: VITE_API_URL=https://api.tudominio.com
 * 
 * IMPORTANTE: Para usar HTTPS, configura la variable de entorno VITE_API_URL
 * en un archivo .env en la raíz del proyecto
 */
const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:8000';

export { API_BASE_URL };

