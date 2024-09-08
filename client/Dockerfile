# syntax=docker/dockerfile:1.4

ARG NODE_VERSION=20.5.1

FROM node:${NODE_VERSION}-alpine AS development

ENV CI=true
ENV PORT=3000

ARG REACT_APP_HOST_URL
ENV REACT_APP_HOST_URL=$REACT_APP_HOST_URL

WORKDIR /code
COPY package.json /code/package.json
RUN npm ci
COPY . /code

CMD [ "npm", "start" ]
