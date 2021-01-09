# pull official base image
FROM node:13.12.0-alpine

# set working directory
WORKDIR /frontend

# add `/frontend/node_modules/.bin` to $PATH
ENV PATH /frontend/node_modules/.bin:$PATH

# install frontend dependencies
COPY package*.json ./
RUN npm install --silent typescript

# add frontend
COPY . ./

# start frontend
CMD ["npm", "start"]