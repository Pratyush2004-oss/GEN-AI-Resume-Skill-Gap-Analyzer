FROM node:22-bookworm-slim

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

COPY ./backend ./backend
COPY ./frontend ./frontend

RUN npm install --prefix backend
RUN npm install --prefix frontend
RUN npm run build --prefix frontend

ENV NODE_ENV=production
ENV PORT=3000
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
EXPOSE 3000
CMD ["node", "backend/server.js"]