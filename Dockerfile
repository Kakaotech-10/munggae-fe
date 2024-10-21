FROM node:current-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# 최종 이미지(빌드 결과물만 포함)
FROM alpine:latest

WORKDIR /app

COPY --from=build /app/dist ./dist