FROM node:alpine

ENV NODE_ENV=development
ENV PORT=80
ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8

# set time zone
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

# add file
ADD dist /home/graphql
ADD package.json /home/graphql
ADD start.sh /home/graphql 

WORKDIR /home/graphql

# npm install
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install 

ENTRYPOINT ["sh", "./start.sh"]
