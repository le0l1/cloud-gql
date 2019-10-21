FROM node:alpine

ENV NODE_ENV=development
ENV PORT=80
ENV TZ='‎Asia/Shanghai‎'

# set our environment variable
ENV MUSL_LOCPATH="/usr/share/i18n/locales/musl"

# install libintl
# then install dev dependencies for musl-locales
# clone the sources
# build and install musl-locales
# remove sources and compile artifacts
# lastly remove dev dependencies again
RUN apk --no-cache add libintl && \
	apk --no-cache --virtual .locale_build add cmake make musl-dev gcc gettext-dev git && \
	git clone https://gitlab.com/rilian-la-te/musl-locales && \
	cd musl-locales && cmake -DLOCALE_PROFILE=OFF -DCMAKE_INSTALL_PREFIX:PATH=/usr . && make && make install && \
	cd .. && rm -r musl-locales && \
	apk del .locale_build

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
