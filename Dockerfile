# syntax=docker/dockerfile:1
# Production static site + nginx (see nginx.conf). API is proxied to backend on the Docker network.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_SITE_URL=https://morocco-mosaic.com
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_API_URL=https://morocco-mosaic.com/api
ARG SEO_API_BASE=https://morocco-mosaic.com/api
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV SEO_API_BASE=$SEO_API_BASE

# Static SEO HTML per route (title, canonical, hreflang) for Googlebot without JavaScript.
RUN npm run build:seo

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx-seo-slugs.conf /etc/nginx/conf.d/seo-slugs.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
