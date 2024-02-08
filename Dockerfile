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
RUN mkdir logs
WORKDIR /app/backend
RUN npm install --omit=dev
COPY backend/ .

ENV NODE_ENV production
ENV SUPERTOKENS_CONNECTIONURI "$SUPERTOKENS_CONNECTIONURI"
ENV SUPERTOKENS_APIKEY "$SUPERTOKENS_APIKEY"
ENV SUPERTOKENS_APPNAME "$SUPERTOKENS_APPNAME"
ENV SUPERTOKENS_APIDOMAIN "$SUPERTOKENS_APIDOMAIN"
ENV SUPERTOKENS_WEBSITEDOMAIN "$SUPERTOKENS_WEBSITEDOMAIN"

CMD ["node", "index.mjs"]