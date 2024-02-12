# Build worker
FROM node:18 as worker
WORKDIR /app
COPY common/ ./common/
COPY backend/package*.json ./backend/
RUN mkdir logs

WORKDIR /app/backend
RUN npm install --omit=dev
COPY backend/ .

WORKDIR /app
COPY worker/package*.json ./worker/

WORKDIR /app/worker
RUN npm install --omit=dev
COPY worker/ .

ENV NODE_ENV "$NODE_ENV"
ENV BLAST_RPC_URL "$BLAST_RPC_URL"
ENV LOG_DIR "$LOG_DIR"
