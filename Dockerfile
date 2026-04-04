# syntax=docker/dockerfile:1
# Production static site + nginx (see nginx.conf). API is proxied to backend service on the same Docker network.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Optional: set at build time for canonical URLs / OAuth (same as backend SITE_PUBLIC_URL / GOOGLE_CLIENT_ID)
ARG VITE_SITE_URL=
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
