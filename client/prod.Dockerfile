FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY ./client .

# Define build-time arguments
# Set environment variables based on the arguments
ARG REACT_APP_HOST_URL
ENV REACT_APP_HOST_URL=$REACT_APP_HOST_URL

RUN npm run build

# This stage is now named 'build' for clarity
FROM scratch AS artifacts 
# Start from scratch to minimize size
COPY --from=builder /usr/src/app/build /usr/src/app