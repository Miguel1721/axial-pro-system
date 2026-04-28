# Etapa 1: Construcción
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps && npm install terser --save-dev --force

COPY . .

# Recibir la variable desde docker-compose
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Esto fuerza a Vite a usar las variables de producción en la compilación
RUN npm run build --mode production

# Etapa 2: Servidor Web Nginx
FROM nginx:alpine

# Copiar los estáticos generados por Vite a Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración personalizada de Nginx para React Router (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]