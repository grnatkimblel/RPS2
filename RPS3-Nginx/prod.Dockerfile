FROM node:20-alpine AS builder

WORKDIR /app

COPY ./RPS3-Client/package*.json .
RUN npm ci --include=dev

COPY ./RPS3-Client .
COPY ./sharedCode ./src/shared

# Define build-time arguments
# Set environment variables based on the arguments
ARG VITE_HOST_URL
ENV VITE_HOST_URL=$VITE_HOST_URL

RUN npm run build

# This stage is now named 'build' for clarity
FROM scratch AS artifacts 
# Start from scratch to minimize size
COPY --from=builder /app/dist /app

FROM ubuntu:latest


RUN apt-get update -qq && apt-get -y install apache2-utils certbot python3-certbot-nginx cron

# Copy from the client's build stage
COPY --from=artifacts /app /usr/share/RPS3-Nginx/html 

# Optional custom Nginx config
COPY ./RPS3-Nginx/default.prod.conf /etc/RPS3-Nginx/nginx.conf 
COPY ./RPS3-Nginx/certbot.prod.conf /etc/RPS3-Nginx/certbot.nginx.conf

# Create a directory for the certbot challenge
RUN mkdir -p /var/www/certbot/.well-known/acme-challenge

COPY ./RPS3-Nginx/entrypoint.sh /usr/entrypoint.sh
RUN chmod +x /usr/entrypoint.sh

EXPOSE 80
EXPOSE 443

#CMD ["nginx", "-g", "deamon off;"]
ENTRYPOINT ["/usr/entrypoint.sh"]
# ENTRYPOINT for the script
