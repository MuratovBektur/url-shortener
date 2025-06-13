FROM node:22-slim

ARG VUE_GOOGLE_OAUTH_CLIENT_ID=local
ENV VUE_GOOGLE_OAUTH_CLIENT_ID=${VUE_GOOGLE_OAUTH_CLIENT_ID}

WORKDIR /app

RUN npm install -g @quasar/cli

COPY package.json ./
COPY . .
RUN npm install

RUN npm run build