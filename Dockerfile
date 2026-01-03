# Stage 1: Builder - Compilar la aplicación
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar solo los archivos de dependencias primero (aprovecha caché de Docker)
COPY package.json package-lock.json* ./

# Instalar dependencias (incluyendo devDependencies para el build)
# Usa npm install para regenerar el lock file si está desactualizado
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Argumentos de build para variables de entorno
ARG VITE_API_URL


# Exportar como variables de entorno para el build
ENV VITE_API_URL=$VITE_API_URL

# Construir la aplicación para producción
RUN npm run build

# Stage 2: Production - Servir la aplicación con nginx
FROM nginx:alpine

# Copiar los archivos compilados desde el stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

