FROM node:20

ARG REACT_APP_HOST_URL
ENV REACT_APP_HOST_URL=$REACT_APP_HOST_URL

WORKDIR /usr/app

# Copy package files and install dependencies
COPY ./client/package.json ./client/package-lock.json ./
RUN npm install

# Copy public folder (shared)
COPY ./client/public/ ./public/

# COPY ./client .
# COPY ./sharedCode/ ./shared

RUN npm install

CMD ["npm", "run", "start", "--", "--host"]