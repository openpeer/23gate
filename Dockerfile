# Build frontend
FROM node:18 as frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
COPY common/ ../common
RUN npm run build

# Build backend
FROM node:18 as backend
WORKDIR /app
COPY --from=frontend /app/frontend-dist ./frontend-dist
COPY backend/package*.json ./backend/
COPY common/ ../common
WORKDIR /app/backend
RUN npm install --omit=dev
COPY backend/ .

CMD ["node", "index.mjs"]