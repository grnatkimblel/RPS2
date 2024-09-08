FROM node:20

ARG REACT_APP_HOST_URL
ENV REACT_APP_HOST_URL=$REACT_APP_HOST_URL

WORKDIR /usr/src/app

COPY . .

RUN npm install


CMD ["npm", "run", "start", "--", "--host"]