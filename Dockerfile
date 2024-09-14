
#################################
#             Base              #
#################################
FROM node:lts-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build the NestJS app (in a multi-stage build for production)
FROM base AS build
RUN npm run build


#################################
#           Production          #
#################################
FROM node:lts-alpine AS production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

EXPOSE 3000

CMD ["node", "dist/main"]

#################################
#          Development          #
#################################
FROM base AS development

WORKDIR /app

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
