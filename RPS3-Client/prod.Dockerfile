FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY ./RPS3-Client .

# Define build-time arguments
# Set environment variables based on the arguments
ARG VITE_HOST_URL
ENV VITE_HOST_URL=$VITE_HOST_URL

RUN npm run build

# This stage is now named 'build' for clarity
FROM scratch AS artifacts 
# Start from scratch to minimize size
COPY --from=builder /usr/src/app/build /usr/src/app