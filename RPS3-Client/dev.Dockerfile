FROM node:20

ARG VITE_HOST_URL
ENV VITE_HOST_URL=$VITE_HOST_URL

WORKDIR /usr/app

# Copy package files and install dependencies
COPY ./RPS3-Client/package*.json ./
RUN npm ci

COPY . .

# Use a command that supports polling for file changes
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--poll"]