# Dockerización y Deploy en Render

## 🐳 Construcción Local

### Construir la imagen:
```bash
docker build -t notesfe:latest .
```

### Ejecutar el contenedor:
```bash
docker run -p 8080:80 notesfe:latest
```

La aplicación estará disponible en `http://localhost:8080`

## 🚀 Deploy en Render

### Opción 1: Usando render.yaml (Recomendado)

1. Conecta tu repositorio de GitHub a Render
2. Render detectará automáticamente el archivo `render.yaml`
3. En la configuración del servicio, agrega las variables de entorno:
   - `VITE_API_URL`: URL de tu API backend (ej: `https://tu-api.onrender.com`)
   - `VITE_SUPABASE_URL`: (si usas Supabase)
   - `VITE_SUPABASE_ANON_KEY`: (si usas Supabase)

**Importante**: Render pasará automáticamente estas variables como build args al Dockerfile.

### Opción 2: Configuración Manual

1. En Render, crea un nuevo **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Environment**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Build Command**: (dejar vacío, Docker lo maneja)
   - **Start Command**: (dejar vacío, Docker lo maneja)

4. Agrega las variables de entorno:
   - `VITE_API_URL`: URL de tu API backend
   - `VITE_SUPABASE_URL`: (si aplica)
   - `VITE_SUPABASE_ANON_KEY`: (si aplica)

5. Deploy!

## 📝 Variables de Entorno

Asegúrate de configurar estas variables en Render (Settings → Environment):

```bash
VITE_API_URL=https://tu-api-backend.onrender.com
# O para desarrollo local:
# VITE_API_URL=http://localhost:8000
```

**Nota Importante**: 
- Las variables que empiezan con `VITE_` se inyectan en el **build time** (no runtime)
- Render automáticamente las pasa como build args al Dockerfile
- Si cambias estas variables, necesitas hacer un nuevo deploy para que se apliquen

## 🔧 Optimizaciones Aplicadas

✅ **Multi-stage builds**: Reduce el tamaño final de la imagen
✅ **Imagen Alpine**: ~150MB vs ~900MB (85% más pequeño)
✅ **Caché de Docker**: Orden estratégico de comandos
✅ **Nginx optimizado**: Gzip, cache headers, SPA routing

## 📊 Resultados Esperados

- **Tamaño de imagen**: ~85MB (vs 1.2GB sin optimizar)
- **Tiempo de build**: ~2-3 minutos
- **Tiempo de deploy**: 15x más rápido

## 🐛 Troubleshooting

### Build falla
- Verifica que `package.json` y `package-lock.json` estén en el repo
- Revisa los logs de build en Render

### Variables de entorno no funcionan
- Recuerda que Vite necesita variables con prefijo `VITE_`
- Reinicia el servicio después de agregar variables

### Rutas no funcionan (404)
- Verifica que `nginx.conf` esté copiado correctamente
- El archivo debe tener la regla `try_files` para SPA routing

