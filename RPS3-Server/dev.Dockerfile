# syntax=docker/dockerfile:1
FROM node:20.5.1

# Use production node environment by default.
ENV NODE_ENV development
ENV JWT_ACCESS_TOKEN_SECRET=1234
ENV JWT_REFRESH_TOKEN_SECRET=5678

WORKDIR /app

# 9229 and 9230 (tests) for debug
# EXPOSE 3100 3200 3300 9229 9230

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=./RPS3-Server/package.json,target=package.json \
    --mount=type=bind,source=./RPS3-Server/package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY ./RPS3-Server .
COPY ./sharedCode ./shared


# Run the application.
CMD ["npm", "run", "dev"]