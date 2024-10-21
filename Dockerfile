FROM node:current-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:current-slim

WORKDIR /app

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["npx", "vite", "preview", "--port", "3000"]
