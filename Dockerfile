# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --omit=dev
RUN cp -R node_modules prod_node_modules
RUN npm install

# ---- Build ----
FROM dependencies AS build
COPY . .
RUN npm run build

# ---- Release ----
FROM base AS release
COPY ["package.json", "./"]
COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=build /app/dist .
COPY ./public/ ./public

EXPOSE 80
ENV NODE_ENV=production
CMD ["node", "server.js"]