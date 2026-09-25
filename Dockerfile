FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

COPY ./backend ./backend
COPY ./frontend ./frontend

RUN npm install --prefix backend
RUN cd backend && npx puppeteer browsers install chrome
RUN npm install --prefix frontend
RUN npm run build --prefix frontend

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "backend/server.js"]