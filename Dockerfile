FROM node:alpine

ENV NODE_ENV=development
ENV PORT=80

# add file
ADD dist /home/graphql
ADD package.json /home/graphql


WORKDIR /home/graphql

# npm install
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install 


ENTRYPOINT ["npm", "run start"]