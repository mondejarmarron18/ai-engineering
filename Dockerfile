FROM oven/bun:1.2.4-alpine

WORKDIR /app

COPY package*.json bun.lock ./

RUN bun install

COPY src ./src

CMD bun dev