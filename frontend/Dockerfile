FROM node:13.12.0-alpine

WORKDIR /frontend

ENV PATH /frontend/node_modules/.bin:$PATH

COPY package.json ./
COPY yarn.lock ./
RUN yarn install
RUN yarn global add react-scripts@3.4.1

COPY . ./

CMD ["yarn", "start"]