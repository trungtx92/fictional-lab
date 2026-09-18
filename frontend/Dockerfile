# --- build stage -----------------------------------------------------
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Vite inlines VITE_* vars at build time, so it must be passed as a build arg,
# not a runtime env var (Cloud Run env vars have no effect on a static bundle).
ARG VITE_API_BASE_URL=https://sales-website-backend-1039491775944.us-central1.run.app
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- runtime stage -----------------------------------------------------
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run injects PORT (default 8080); nginx.conf listens on it directly.
EXPOSE 8080
