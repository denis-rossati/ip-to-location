FROM node as base

WORKDIR /app

COPY src ./src

COPY server ./server

COPY package.json package-lock.json tsconfig.json .dev.env ./

RUN ["npm", "install"]

RUN ["npm", "run", "build"]

FROM node:alpine

WORKDIR /app

COPY --from=base /app/package.json /app/package-lock.json /app/.dev.env ./

COPY --from=base /app/build ./build

RUN ["npm", "install", "--omit=dev"]
