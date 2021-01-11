FROM node:13.12.0-alpine

WORKDIR /frontend

ENV PATH /frontend/node_modules/.bin:$PATH

COPY package*.json ./
RUN npm install --silent typescript

COPY . ./

CMD ["npm", "start"]