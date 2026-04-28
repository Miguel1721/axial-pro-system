FROM node:18-alpine

WORKDIR /app

# Instalar dependencias primero (cache)
COPY package*.json ./
RUN npm install --production

# Copiar el resto del código
COPY . .

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Exponemos el puerto INTERNAMENTE (no hacia el host)
EXPOSE 3000

CMD ["node", "server.js"]