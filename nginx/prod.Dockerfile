FROM node:20-alpine AS builder

WORKDIR /app

COPY ./client/package*.json .
RUN npm ci --omit=dev

COPY ./client .
COPY ./sharedCode ./src/shared

# Define build-time arguments
# Set environment variables based on the arguments
ARG REACT_APP_HOST_URL
ENV REACT_APP_HOST_URL=$REACT_APP_HOST_URL

RUN npm run build

# This stage is now named 'build' for clarity
FROM scratch AS artifacts 
# Start from scratch to minimize size
COPY --from=builder /app/build /app

FROM python:3.9-slim

RUN apt-get update -qq && apt-get -y install apache2-utils certbot python3-certbot-nginx

# Copy from the client's build stage
COPY --from=artifacts /app /usr/share/nginx/html 

# Optional custom Nginx config
COPY ./nginx/default.prod.conf /etc/nginx/nginx.conf 

RUN certbot certonly --webroot-path /usr/share/nginx/html


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
