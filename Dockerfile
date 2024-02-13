# Build backend
FROM node:18 as backend
WORKDIR /app
COPY common/ ./common/
COPY backend/package*.json ./backend/
RUN mkdir logs
RUN chmod 777 logs
WORKDIR /app/backend
RUN npm install --omit=dev
COPY backend/ .

ENV NODE_ENV "$NODE_ENV"
ENV LISTEN_HOST "$LISTEN_HOST"
ENV LISTEN_PORT "$LISTEN_PORT"

RUN npm install -g nodemon

CMD ["nodemon", "index.mjs"]