FROM node:22-alpine AS client

WORKDIR /app

COPY  ./client/package*.json ./

RUN npm install

COPY ./client/  ./

RUN npm run build

FROM node:22-alpine AS server

WORKDIR /app

COPY ./server/package*.json ./

RUN npm install

COPY ./server/ ./

COPY --from=client /app/dist ./public

EXPOSE 8000

CMD [ "npm" , "start" ]