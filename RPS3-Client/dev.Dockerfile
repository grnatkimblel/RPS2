FROM node:20

ARG VITE_HOST_URL
ENV VITE_HOST_URL=$VITE_HOST_URL

WORKDIR /usr/app

# Copy package files and install dependencies
COPY ./RPS3-Client/package*.json ./
RUN npm ci

COPY ./RPS3-Client/ ./

#This is apparently just for show. It tells the container something but doesnt actually do the exposing
EXPOSE 3000

# Use a command that supports polling for file changes
CMD ["npm", "run", "dev"]